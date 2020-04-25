const showdown = require('showdown');
const webpack = require('webpack');
const hljs = require('highlight.js');
const path = require('path');
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

function getHtmlFromMarkdown(markdown) {
    const showdownConverter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        openLinksInNewWindow: true,
        metadata: true,
    });

    let html = showdownConverter.makeHtml(markdown);

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

    const domPurify = createDOMPurify(new JSDOM('').window);

    return domPurify.sanitize(html);
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
            <title>${params.metadata.title}${
        params.metadata.blogName ? ` | ${params.metadata.blogName}` : ''
    }</title>
            <meta name="description" content="${params.metadata.description}">
            <meta name="author" content="${params.metadata.author}">
            <link href="${params.metadata.logo}" rel='shortcut icon'>
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

function getParsedBlog(blog) {
    const { baseUrl, slogan, authorWebsite, author } = blog.metadata;
    const header = {
        blogAuthor: author,
        blogUrl: baseUrl,
        slogan: slogan,
        website: authorWebsite,
        tagsPageUrl: getItemUrl(baseUrl, tagsPageOutputPath),
    };

    return {
        ...blog,
        header,
        posts: blog.posts
            .map((post) => {
                const outputPath = slugify(
                    post.urlSlug ? post.urlSlug : post.title
                );

                return JSON.parse(
                    JSON.stringify({
                        ...post,
                        metadata: {
                            ...blog.metadata,
                            title: post.title,
                            description: post.description,
                        },
                        dateParsed: moment(post.date).format('MMMM D, YYYY'),
                        readTime: `${getReadTime(post.content)} min. read`,
                        outputPath,
                        url: getItemUrl(baseUrl, outputPath),
                        content: getHtmlFromMarkdown(post.content),
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
                    })
                );
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
            metadata: {
                ...parsedBlog.metadata,
                title:
                    parsedBlog.metadata.title +
                    (idx === 0 ? '' : ' | Page ' + (idx + 1)),
            },
            posts: parsedBlog.posts.slice(el[0], el[1] + 1),
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
                metadata: newParsedBlog.metadata,
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
            const { baseUrl } = parsedBlog.metadata;

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
                    header: parsedBlog.header,
                };

                (post.mediaFiles || []).forEach((mediaFile) => {
                    results[post.outputPath + '/' + mediaFile.basename] = {
                        encoding: 'binary',
                        content: mediaFile.content,
                    };
                });

                results[post.outputPath + '/index.html'] = {
                    encoding: 'utf8',
                    content: getMainHtml({
                        metadata: post.metadata,
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
                    metadata: {
                        ...parsedBlog.metadata,
                        title: 'Tags',
                    },
                    posts: [
                        {
                            header: parsedBlog.header,
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
                            metadata: {
                                ...parsedBlog.metadata,
                                title: capitalizeStr(
                                    tagPages[tagOutputPath].name
                                ),
                            },
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

            return results;
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
}

function generateBlogFileStructureFromDir(dirpath, attrs = {}) {
    const postsPath = path.join(dirpath, 'posts');

    const indexParsedMd = getParsedMarkdown(
        fsExtra.readFileSync(path.join(dirpath, 'index.md'), 'utf8')
    );

    const posts = fsExtra
        .readdirSync(postsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => {
            const postDir = path.join(postsPath, dirent.name);
            const postIndexMdPath = path.join(postDir, 'index.md');

            const mediaFiles = fsExtra
                .readdirSync(postDir)
                .filter((el) => /\.(png|jpg|jpeg|gif|mp4)$/.test(el))
                .map((el) => {
                    return {
                        basename: el,
                        content: fsExtra.readFileSync(
                            path.resolve(postDir, el),
                            'binary'
                        ),
                    };
                });

            const postIndexMdContent = fsExtra.readFileSync(
                postIndexMdPath,
                'utf8'
            );
            const postIndexParsedMd = getParsedMarkdown(postIndexMdContent);

            return {
                ...postIndexParsedMd.metadata,
                urlSlug: dirent.name,
                mediaFiles,
                content: postIndexParsedMd.content,
            };
        });

    const blog = {
        postsPerPage: indexParsedMd.metadata.postsPerPage,
        metadata: { ...indexParsedMd.metadata },
        posts,
    };

    return generateBlogFileStructure(blog, attrs);
}

function getParsedMarkdown(markdown) {
    const metadata = (function init() {
        const showdownConverter = new showdown.Converter({
            metadata: true,
        });

        showdownConverter.makeHtml(markdown);
        let metadata = showdownConverter.getMetadata();

        Object.keys(metadata).forEach((key) => {
            try {
                metadata[key] = unescapeHtml(metadata[key]);
                metadata[key] = JSON.parse(metadata[key]);
            } catch (e) {
                if (key === 'tags') {
                    metadata[key] = metadata[key].split(',');
                }
            }
        });

        return metadata;
    })();

    return {
        metadata,
        content: markdown.replace(/---[\s\S]+?---[\s\S]*?/, ''),
    };
}

module.exports = {
    getParsedBlog,
    generateBlogFileStructure,
    generateBlogFileStructureFromDir,
};
