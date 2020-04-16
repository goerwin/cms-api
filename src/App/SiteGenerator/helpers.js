const showdown = require('showdown');

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
        blogUrl: blog.metadata.baseUrl + '/index.html',
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

module.exports = {
    getMainHtml,
    getParsedBlog,
};
