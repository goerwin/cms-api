const showdown = require('showdown');
const webpack = require('webpack');
const hljs = require('highlight.js');
const path = require('path');
const filesize = require('filesize');
const unionfs = require('unionfs');
const grayMatter = require('gray-matter');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const fsExtra = require('fs-extra');
const { createFsFromVolume, Volume } = require('memfs');
const moment = require('moment');
const requireFromString = require('require-from-string');
const webpackConfigs = require('./webpackConfigs');
const tagsPageOutputPath = 'tags';

function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
    var to = 'aaaaaeeeeeiiiiooooouuuunc------';

    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    return str
        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
}

function getReadTime(text) {
    if (!text) {
        return 0;
    }

    const WORDS_PER_MINUTE = 250;

    return Math.ceil(text.match(/\w{3,}/g).length / WORDS_PER_MINUTE);
}

function capitalizeStr(str) {
    return str.replace(/(?:^|\s)\S/g, (a) => {
        return a.toUpperCase();
    });
}

function getPagination(totalItems, itemsPerPage = totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let itemsDistribution = [];

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const startIdx = pageIdx * itemsPerPage;

        itemsDistribution.push([startIdx, startIdx + itemsPerPage - 1]);
    }

    return { itemsDistribution, totalItems, itemsPerPage, totalPages };
}

function getItemUrl(baseUrl, urlSlug) {
    return path.join(baseUrl, '/', urlSlug).replace(':/', '://');
}

function unescapeHtml(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

function getMainHtml(params) {
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta http-equiv="cache-control" content="no-cache"/>
            <title>${params.title}${
        params.blogName ? ` | ${params.blogName}` : ''
    }</title>
            <meta name="description" content="${params.description}">
            <meta name="author" content="${params.author}">
            <link href="${params.logo}" rel='shortcut icon'>
            <link rel="stylesheet" href="${params.cssFilePath}"></link>
        </head>

        <body>
            <div id="app-root">${params.htmlContent}</div>
            ${`<script>
                window.__PAGE__ = '${params.page}';
                window.__STATE__ = ${params.pageState};
            </script>`}
            ${`<script src="${params.jsFilePath}"></script>`}
        </body>
        </html>
    `;
}

function getObjWithReplacedAssetPaths(obj, baseUrl, publicFilesHashTable) {
    for (var k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            getObjWithReplacedAssetPaths(obj[k], baseUrl, publicFilesHashTable);
        } else {
            let content = obj[k];

            if (typeof content === 'string') {
                obj[k] = content.replace(/require\((.*?)\)/g, (match, g1) => {
                    const newAssetUrl =
                        publicFilesHashTable[g1.replace(/^\//, '')];

                    return path
                        .join(baseUrl, 'public', newAssetUrl)
                        .replace(':/', '://');
                });
            }
        }
    }

    return obj;
}

function getParsedBlog(blog) {
    const { baseUrl } = blog;
    const newBlog = {
        ...blog,
        tagsPageUrl: getItemUrl(baseUrl, tagsPageOutputPath),
    };
    const publicFilesHashTable = (blog.publicFiles || []).reduce(
        (prev, curr) => {
            prev[curr.name] = curr.finalName;

            return prev;
        },
        {}
    );

    delete newBlog.publicFiles;

    const parsedBlog = {
        ...newBlog,
        posts: newBlog.posts
            .map((post) => {
                const outputPath = slugify(
                    post.urlSlug ? post.urlSlug : post.title
                );

                const newPost = {
                    ...newBlog,
                    ...post,
                    readTime:
                        post.readTime === undefined
                            ? getReadTime(post.content)
                            : post.readTime,
                    dateParsed: moment(post.date).format('MMMM D, YYYY'),
                    outputPath,
                    url: getItemUrl(baseUrl, outputPath),
                    tags:
                        post.tags &&
                        post.tags.map((tag) => {
                            const outputPath =
                                tagsPageOutputPath + '/' + slugify(tag);

                            return {
                                name: tag,
                                outputPath,
                                url: getItemUrl(baseUrl, outputPath),
                            };
                        }),
                };

                delete newPost.posts;

                return JSON.parse(JSON.stringify(newPost));
            })
            .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
            .map((post, idx, posts) => ({
                ...post,
                previousPost:
                    idx === 0
                        ? null
                        : {
                              title: posts[idx - 1].title,
                              url: posts[idx - 1].url,
                          },
                nextPost:
                    idx === posts.length - 1
                        ? null
                        : {
                              title: posts[idx + 1].title,
                              url: posts[idx + 1].url,
                          },
            })),
    };

    return getObjWithReplacedAssetPaths(
        parsedBlog,
        baseUrl,
        publicFilesHashTable
    );
}

function parseAssetsWithWebpack(assets) {
    const inputMemFs = new unionfs.Union();
    const outputMemfs = createFsFromVolume(new Volume());
    outputMemfs.join = path.join;
    const workingDir = '/';
    const assetsFilename = 'assets.js';

    inputMemFs.use(outputMemfs).use(fsExtra);

    outputMemfs.mkdirpSync(workingDir);

    // create files in dir
    assets.forEach((asset) => {
        inputMemFs.writeFileSync(
            path.join(workingDir, asset.basename),
            asset.content,
            asset.encoding
        );
    });

    // create assets.js
    inputMemFs.writeFileSync(
        path.join(workingDir, assetsFilename),
        assets.reduce(
            (prev, cur) => (prev += `require('./${cur.basename}');\n`),
            ''
        ),
        'utf-8'
    );

    const compiler = webpack({
        entry: { app: path.join(workingDir, assetsFilename) },
        resolveLoader: {
            modules: [path.join(__dirname, 'node_modules')],
        },
        resolve: {
            modules: [path.join(__dirname, 'node_modules')]
        },
        module: {
            rules: [
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash].[ext]',
                            },
                        },
                        {
                            loader: 'image-webpack-loader',
                        },
                    ],
                },
            ],
        },
        output: {
            filename: 'assets.bundle.js',
            path: '/',
        },
    });

    compiler.inputFileSystem = inputMemFs;
    compiler.outputFileSystem = outputMemfs;

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err || stats.compilation.errors.length > 0) {
                reject(stats.compilation.errors);

                return;
            }

            const assets = stats.compilation.assets;
            const parsedAssets = Object.keys(stats.compilation.assets)
                .map((key) => {
                    const content = assets[key].source();

                    return {
                        name: key.replace(/(.*?)\.(.*)\.(.*$)/, '$1.$3'),
                        finalName: key,
                        content,
                        encoding: 'binary',
                    };
                })
                .filter((asset) => asset.name !== assetsFilename);

            resolve(parsedAssets);
        });
    });
}

function getParsedAsset(stats) {
    return Object.keys(stats.compilation.assets)
        .map((key) => ({
            id: key,
            asset: stats.compilation.assets[key],
        }))
        .reduce(
            (acc, asset) => {
                if (/^index\..*\.js$/.test(asset.id)) {
                    acc.jsFile = asset;
                } else if (/.*\.css$/.test(asset.id)) {
                    acc.cssFile = asset;
                }

                return acc;
            },
            { cssFile: null, jsFile: null }
        );
}

function getIndexPagesWithPagination({
    parsedBlog,
    cssFilePath,
    jsFilePath,
    paginationBaseUrl,
    stringifiedSSRReactApp,
}) {
    const pagination = getPagination(
        parsedBlog.posts.length,
        parsedBlog.postsPerPage
    );

    return pagination.itemsDistribution.map((el, idx) => {
        const key = idx === 0 ? 'index.html' : `${idx + 1}/index.html`;

        const newParsedBlog = {
            ...parsedBlog,
            title: parsedBlog.title + (idx === 0 ? '' : ' | ' + (idx + 1)),
            posts: parsedBlog.posts.slice(el[0], el[1] + 1).map((post) => {
                return {
                    ...post,
                    content: undefined,
                };
            }),
            pagination: {
                ...pagination,
                items: pagination.itemsDistribution.map((_, idx) => ({
                    id: idx + 1,
                    href: path.join(
                        paginationBaseUrl,
                        idx === 0 ? '' : String(idx + 1)
                    ),
                })),
                activePage: idx + 1,
            },
        };

        return {
            key,
            html: getMainHtml({
                ...newParsedBlog,
                htmlContent: stringifiedSSRReactApp.getIndexPage(newParsedBlog),
                cssFilePath,
                jsFilePath,
                pageState: JSON.stringify(newParsedBlog),
                page: 'index',
            }),
        };
    });
}

function getAllPostTags(parsedPosts) {
    let tags = {};

    parsedPosts.forEach((post) => {
        post.tags &&
            post.tags.forEach((tag) => {
                tags[tag.outputPath] = tag;
            });
    });

    return Object.keys(tags).map((key) => tags[key]);
}

function getWebpackStats(webpackConfig = {}) {
    return new Promise((resolve, reject) => {
        const memfs = createFsFromVolume(new Volume());
        memfs.join = path.join;
        const webpackCompiler = webpack(webpackConfig);

        webpackCompiler.outputFileSystem = memfs;

        webpackCompiler.run((err, stats) => {
            if (err || stats.hasErrors()) {
                reject(stats.compilation.errors);

                return;
            }

            resolve(stats);
        });
    });
}

function generateBlogFileStructure(blog, attrs = {}) {
    const memfs = createFsFromVolume(new Volume());
    memfs.join = path.join;
    const { serverConfig, clientConfig } = webpackConfigs(attrs.env);

    return Promise.all([
        getWebpackStats(serverConfig),
        getWebpackStats(clientConfig),
    ])
        .then(([serverStats, clientStats]) => {
            const serverAssets = getParsedAsset(serverStats);
            const clientAssets = getParsedAsset(clientStats);
            const parsedBlog = getParsedBlog(blog);
            const { baseUrl } = parsedBlog;

            const stringifiedSSRReactApp = requireFromString(
                serverAssets.jsFile.asset.source()
            );

            const results = {
                [clientAssets.cssFile.id]: {
                    encoding: 'utf8',
                    content: clientAssets.cssFile.asset.source(),
                },
                [clientAssets.jsFile.id]: {
                    encoding: 'utf8',
                    content: clientAssets.jsFile.asset.source(),
                },
            };

            const cssFilePath = getItemUrl(baseUrl, clientAssets.cssFile.id);
            const jsFilePath = getItemUrl(baseUrl, clientAssets.jsFile.id);

            // Index page
            getIndexPagesWithPagination({
                parsedBlog,
                cssFilePath,
                jsFilePath,
                stringifiedSSRReactApp,
                paginationBaseUrl: baseUrl,
            }).forEach((indexPageWithPagination) => {
                results[indexPageWithPagination.key] = {
                    encoding: 'utf8',
                    content: indexPageWithPagination.html,
                };
            });

            // Posts pages
            parsedBlog.posts.forEach((post) => {
                const pageState = {
                    ...post,
                };

                results[post.outputPath + '/index.html'] = {
                    encoding: 'utf8',
                    content: getMainHtml({
                        ...post,
                        htmlContent: stringifiedSSRReactApp.getPostPage(
                            pageState
                        ),
                        cssFilePath,
                        jsFilePath,
                        pageState: JSON.stringify(pageState),
                        page: 'post',
                    }),
                };
            });

            // Tag page
            getIndexPagesWithPagination({
                parsedBlog: {
                    ...parsedBlog,
                    title: 'Tags',
                    posts: [
                        {
                            ...parsedBlog,
                            tags: getAllPostTags(parsedBlog.posts),
                            title: 'Tags',
                            customDescription: 'All Blog tags',
                        },
                    ],
                },
                cssFilePath,
                jsFilePath,
                stringifiedSSRReactApp,
                paginationBaseUrl: baseUrl,
            }).forEach((indexPageWithPagination) => {
                results[
                    tagsPageOutputPath + '/' + indexPageWithPagination.key
                ] = {
                    encoding: 'utf8',
                    content: indexPageWithPagination.html,
                };
            });

            // Tag pages
            parsedBlog.posts
                .reduce(
                    (prev, post, idx) => {
                        post.tags &&
                            post.tags.forEach((tag) => {
                                prev[0][tag.outputPath] = {
                                    name: tag.name,
                                    posts: [
                                        ...(prev[0][tag.outputPath] &&
                                        prev[0][tag.outputPath].posts
                                            ? prev[0][tag.outputPath].posts
                                            : []),
                                        idx,
                                    ],
                                };
                            });

                        return prev;
                    },
                    [{}]
                )
                .forEach((tagPages) => {
                    // { [tagOutpuPath]: { name, postIdxs[], url } }
                    // tagPages = { [${tagUrl}technology]: [2, 4, 5] }
                    Object.keys(tagPages).forEach((tagOutputPath) => {
                        let newParsedBlog = {
                            ...parsedBlog,
                            title: capitalizeStr(tagPages[tagOutputPath].name),
                            posts: tagPages[tagOutputPath].posts.map(
                                (el) => parsedBlog.posts[el]
                            ),
                        };

                        getIndexPagesWithPagination({
                            parsedBlog: newParsedBlog,
                            cssFilePath,
                            jsFilePath,
                            paginationBaseUrl: getItemUrl(
                                baseUrl,
                                tagOutputPath
                            ),
                            stringifiedSSRReactApp,
                        }).forEach((indexPageWithPagination) => {
                            results[
                                `${tagOutputPath}/${indexPageWithPagination.key}`
                            ] = {
                                encoding: 'utf8',
                                content: indexPageWithPagination.html,
                            };
                        });
                    });
                });

            // Public files
            (blog.publicFiles || []).forEach((file) => {
                results[path.join('public', file.finalName)] = {
                    encoding: file.encoding,
                    content: file.content,
                };
            });

            Object.keys(results).forEach((key) => {
                results[key].filesize = filesize(results[key].content.length);
            });

            return results;
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
}

function generateBlogFileStructureFromDir(dirPath, attrs = {}) {
    const absDirPath = path.resolve(dirPath);
    const publicPath = path.join(absDirPath, 'public');
    const postsPath = path.join(absDirPath, 'posts');

    const indexParsedMd = getParsedMarkdown(
        fsExtra.readFileSync(path.join(absDirPath, 'index.md'), 'utf8')
    );

    const posts = fsExtra
        .readdirSync(postsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => {
            const postMdFilePath = path.join(postsPath, dirent.name);
            const postMdContent = fsExtra.readFileSync(postMdFilePath, 'utf8');
            const postParsedMd = getParsedMarkdown(postMdContent);

            return {
                ...postParsedMd,
                urlSlug: dirent.name.replace('.md', ''),
            };
        });

    const publicFiles = fsExtra
        .readdirSync(publicPath)
        .filter((el) => /\.(png|jpg|jpeg|gif|mp4)$/.test(el))
        .map((filename) => {
            const content = fsExtra.readFileSync(
                path.resolve(publicPath, filename),
                'binary'
            );

            return {
                basename: filename,
                encoding: 'binary',
                content,
            };
        });

    return parseAssetsWithWebpack(publicFiles).then(
        (parsedAssetsWithWebpack) => {
            const blog = {
                ...indexParsedMd,
                posts,
                publicFiles: parsedAssetsWithWebpack,
            };

            return generateBlogFileStructure(blog, attrs);
        }
    );
}

function getParsedMarkdown(markdown) {
    const parsedMarkdownWithMetadata = grayMatter(markdown);

    const showdownConverter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        openLinksInNewWindow: true,
    });
    const mdContent = parsedMarkdownWithMetadata.content;
    let html = showdownConverter.makeHtml(mdContent);

    // Highlight Code
    html = html.replace(
        /(<pre><code.*?>)([\s\S]+?)(<\/code><\/pre>)/gm,
        (match, g1, code, g3) => {
            const language = g1.match(/<code[\s+]class="\s*(\w*)/)[1];
            let unescapedCode = unescapeHtml(code);
            let hlResult;

            if (language) {
                hlResult = hljs.highlight(language, unescapedCode);
            } else {
                hlResult = hljs.highlightAuto(unescapedCode).value;
            }

            return `${g1}${hlResult.value}${g3}`;
        }
    );

    return {
        ...parsedMarkdownWithMetadata.data,
        readTime: getReadTime(mdContent),
        content: createDOMPurify(new JSDOM('').window).sanitize(html),
    };
}

function prettyPrintBlogFileStructure(blogFileStructure) {
    let result = '';
    const pages = Object.keys(blogFileStructure);

    pages.forEach((page) => {
        result += page + ' | ' + blogFileStructure[page].filesize + '\n';
    });

    return result;
}

module.exports = {
    prettyPrintBlogFileStructure,
    getParsedBlog,
    generateBlogFileStructure,
    generateBlogFileStructureFromDir,
};
