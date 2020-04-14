function getMainHtml(params) {
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="cache-control" content="no-cache"/>
            <title>${params.metadata.title}</title>
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

module.exports = {
    getMainHtml,
};
