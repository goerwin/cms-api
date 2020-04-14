function getMainHtml(params) {
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>The HTML5</title>
            <meta name="description" content="The HTML5 Herald">
            <meta name="author" content="Erwin Gaitan">
            <link rel="stylesheet" href="./${params.cssFilePath}"></link>
        </head>

        <body>
            <div id="app-root">${params.htmlContent}</div>
            ${`<script>window.__PAGE__ = '${params.page}'</script>`}
            ${`<script>window.__STATE__ = ${params.pageState}</script>`}
            ${`<script src="./${params.jsFilePath}"></script>`}
        </body>
        </html>
    `;
}

module.exports = {
    getMainHtml,
};
