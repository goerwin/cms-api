const showdown = require('showdown');
const webpack = require('webpack');
const hljs = require('highlight.js');
const path = require('path');
const fsExtra = require('fs-extra');
const { createFsFromVolume, Volume } = require('memfs');
const requireFromString = require('require-from-string');
const webpackConfigs = require('./webpackConfigs');

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

function getMainHtml(params) {
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="cache-control" content="no-cache"/>
            <title>${params.metadata.title}${
        params.metadata.blogName ? ` — ${params.metadata.blogName}` : ''
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

function getHtmlFromMarkdown(markdown) {
    const showdownConverter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        openLinksInNewWindow: true,
        metadata: true,
    });

    let html = showdownConverter.makeHtml(markdown);

    // Highlight Code
    html = html.replace(
        /<pre><code.*?>([\s\S]+?)<\/code><\/pre>/gm,
        (match, g1) => {
            return (
                '<pre><code>' +
                hljs.highlightAuto(
                    g1
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                ).value +
                '</code></pre>'
            );
        }
    );

    return html;
}

function getParsedBlog(blog) {
    const header = {
        blogAuthor: blog.metadata.author,
        blogUrl: blog.metadata.baseUrl,
        slogan: blog.metadata.slogan,
        website: blog.metadata.authorWebsite,
    };
    const { baseUrl } = blog.metadata;

    return {
        ...blog,
        header,
        posts: blog.posts
            .map((post) => {
                const outputPath =
                    slugify(post.urlSlug ? post.urlSlug : post.title) + '.html';

                return JSON.parse(
                    JSON.stringify({
                        ...post,
                        header,
                        metadata: {
                            ...blog.metadata,
                            title: post.title,
                            description: post.description,
                        },
                        readTime: `${getReadTime(post.content)} min. read`,
                        outputPath,
                        url: getItemUrl(baseUrl, outputPath),
                        content: getHtmlFromMarkdown(post.content),
                        tags:
                            post.tags &&
                            post.tags.map((tag) => {
                                const outputPath = `tags/${slugify(tag)}`;

                                return {
                                    name: tag,
                                    outputPath,
                                    url: getItemUrl(baseUrl, outputPath),
                                };
                            }),
                    })
                );
            })
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

function capitalizeStr(str) {
    return str.replace(/(?:^|\s)\S/g, (a) => {
        return a.toUpperCase();
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

function getPagination(totalItems, itemsPerPage = totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let itemsDistribution = [];

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const startIdx = pageIdx * itemsPerPage;

        itemsDistribution.push([startIdx, startIdx + itemsPerPage - 1]);
    }

    return { itemsDistribution, totalItems, itemsPerPage, totalPages };
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
        const key = idx === 0 ? 'index.html' : `${idx + 1}.html`;

        const newParsedBlog = {
            ...parsedBlog,
            posts: parsedBlog.posts.slice(el[0], el[1] + 1),
            pagination: {
                ...pagination,
                items: pagination.itemsDistribution.map((_, idx) => ({
                    id: idx + 1,
                    href: path.join(
                        paginationBaseUrl,
                        `${idx === 0 ? 'index' : idx + 1}.html`
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

function getItemUrl(baseUrl, urlSlug) {
    return path.join(baseUrl, '/', urlSlug);
}

function generateBlogFileStructure(blog, attrs = {}) {
    return new Promise((resolve) => {
        const memfs = createFsFromVolume(new Volume());
        memfs.join = path.join;
        const { serverConfig, clientConfig } = webpackConfigs(attrs.env);
        const webpackCompiler = webpack([serverConfig, clientConfig]);

        webpackCompiler.outputFileSystem = memfs;

        webpackCompiler.run((err, multistats) => {
            if (err || multistats.hasErrors()) {
                throw err;
            }

            try {
                const serverAssets = getParsedAsset(multistats.stats[0]);
                const clientAssets = getParsedAsset(multistats.stats[1]);
                const parsedBlog = getParsedBlog(blog);
                const { baseUrl } = parsedBlog.metadata;

                const stringifiedSSRReactApp = requireFromString(
                    serverAssets.jsFile.asset.source()
                );

                const results = {
                    [clientAssets.cssFile
                        .id]: clientAssets.cssFile.asset.source(),
                    [clientAssets.jsFile
                        .id]: clientAssets.jsFile.asset.source(),
                };

                // Index page
                getIndexPagesWithPagination({
                    parsedBlog,
                    cssFilePath: getItemUrl(baseUrl, clientAssets.cssFile.id),
                    jsFilePath: getItemUrl(baseUrl, clientAssets.jsFile.id),
                    stringifiedSSRReactApp,
                    paginationBaseUrl: baseUrl,
                }).forEach((indexPageWithPagination) => {
                    results[indexPageWithPagination.key] =
                        indexPageWithPagination.html;
                });

                // Posts pages
                parsedBlog.posts.forEach((post) => {
                    results[post.outputPath] = getMainHtml({
                        metadata: post.metadata,
                        htmlContent: stringifiedSSRReactApp.getPostPage(post),
                        cssFilePath: clientAssets.cssFile.id,
                        jsFilePath: clientAssets.jsFile.id,
                        pageState: JSON.stringify(post),
                        page: 'post',
                    });
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
                        // tagPages = { [tags/technology]: [2, 4, 5] }
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
                                cssFilePath: getItemUrl(
                                    baseUrl,
                                    clientAssets.cssFile.id
                                ),
                                jsFilePath: getItemUrl(
                                    baseUrl,
                                    clientAssets.jsFile.id
                                ),
                                paginationBaseUrl: getItemUrl(
                                    baseUrl,
                                    tagOutputPath
                                ),
                                stringifiedSSRReactApp,
                            }).forEach((indexPageWithPagination) => {
                                results[
                                    `${tagOutputPath}/${indexPageWithPagination.key}`
                                ] = indexPageWithPagination.html;
                            });
                        });
                    });

                resolve(results);
            } catch (e) {
                console.log(e);
                throw e;
            }
        });
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
            const postIndexMdContent = fsExtra.readFileSync(
                postIndexMdPath,
                'utf8'
            );
            const postIndexParsedMd = getParsedMarkdown(postIndexMdContent);

            return {
                ...postIndexParsedMd.metadata,
                urlSlug: dirent.name,
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
