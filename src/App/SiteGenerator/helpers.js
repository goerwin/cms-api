const showdown = require('showdown');
const webpack = require('webpack');
const path = require('path');
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
    const WORDS_PER_MINUTE = 200;

    return Math.ceil(text.match(/\w{2,}/g).length / WORDS_PER_MINUTE);
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
            <base href="${params.metadata.baseUrl}">
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
    const header = {
        blogAuthor: blog.metadata.author,
        blogUrl: blog.metadata.baseUrl,
        slogan: blog.slogan,
        website: blog.metadata.authorWebsite,
    };

    return {
        ...blog,
        header,
        posts: blog.posts
            .map((post) => ({
                ...post,
                header,
                metadata: {
                    ...blog.metadata,
                    title: post.title,
                    description: post.description,
                },
                readTime: `${getReadTime(post.content)} min. read`,
                url: slugify(post.title) + '.html',
                content: new showdown.Converter().makeHtml(post.content),
                tags:
                    post.tags &&
                    post.tags.map((tag) => ({
                        name: tag,
                        urlSlug: `tags/${slugify(tag)}`,
                    })),
            }))
            .map((post, idx, posts) => ({
                ...post,
                previousPost: idx === 0 ? null : posts[idx - 1],
                nextPost: idx === posts.length - 1 ? null : posts[idx + 1],
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

            const serverAssets = getParsedAsset(multistats.stats[0]);
            const clientAssets = getParsedAsset(multistats.stats[1]);
            const parsedBlog = getParsedBlog(blog);

            const stringifiedSSRReactApp = requireFromString(
                serverAssets.jsFile.asset.source()
            );

            const results = {
                [clientAssets.jsFile.id]: clientAssets.jsFile.asset.source(),
                [clientAssets.cssFile.id]: clientAssets.cssFile.asset.source(),
                'index.html': getMainHtml({
                    metadata: parsedBlog.metadata,
                    htmlContent: stringifiedSSRReactApp.getIndexPage(
                        parsedBlog
                    ),
                    cssFilePath: clientAssets.cssFile.id,
                    jsFilePath: clientAssets.jsFile.id,
                    pageState: JSON.stringify(parsedBlog),
                    page: 'index',
                }),
            };

            // Posts
            parsedBlog.posts.forEach((post) => {
                results[post.url] = getMainHtml({
                    metadata: post.metadata,
                    htmlContent: stringifiedSSRReactApp.getPostPage(post),
                    cssFilePath: clientAssets.cssFile.id,
                    jsFilePath: clientAssets.jsFile.id,
                    pageState: JSON.stringify(post),
                    page: 'post',
                });
            });

            // Tags
            parsedBlog.posts
                .reduce(
                    (prev, post, idx) => {
                        post.tags &&
                            post.tags.forEach((tag) => {
                                prev[0][tag.urlSlug] = {
                                    name: tag.name,
                                    posts: [
                                        ...(prev[0][tag.urlSlug] &&
                                        prev[0][tag.urlSlug].posts
                                            ? prev[0][tag.urlSlug].posts
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
                    Object.keys(tagPages).forEach((tagUrlSlug) => {
                        let newParsedBlog = {
                            ...parsedBlog,
                            posts: tagPages[tagUrlSlug].posts.map(
                                (el) => parsedBlog.posts[el]
                            ),
                        };

                        results[tagUrlSlug + '/index.html'] = getMainHtml({
                            metadata: {
                                ...newParsedBlog.metadata,
                                title: capitalizeStr(tagPages[tagUrlSlug].name),
                            },
                            htmlContent: stringifiedSSRReactApp.getIndexPage(
                                newParsedBlog
                            ),
                            cssFilePath: clientAssets.cssFile.id,
                            jsFilePath: clientAssets.jsFile.id,
                            pageState: JSON.stringify(newParsedBlog),
                            page: 'index',
                        });
                    });
                });

            resolve(results);
        });
    });
}

module.exports = {
    generateBlogFileStructure,
};
