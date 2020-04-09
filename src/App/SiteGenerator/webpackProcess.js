const webpack = require('webpack');
const path = require('path');
const fsExtra = require('fs-extra');
const webpackConfig = require('./webpack.config.prod');

fsExtra.removeSync(webpackConfig.output.path);

webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
        throw err;
    }

    const assets = Object.keys(stats.compilation.assets)
        .map((key) => ({
            id: key,
            absPath: stats.compilation.assets[key].existsAt,
        }))
        .reduce(
            (acc, asset) => {
                if (/^indexSSR\..*\.js$/.test(asset.id)) {
                    acc.jsSSRFile = asset;
                } else if (/^indexClient\..*\.js$/.test(asset.id)) {
                    acc.jsClientFile = asset;
                } else if (/.*\.css$/.test(asset.id)) {
                    acc.cssFiles.push(asset);
                }

                return acc;
            },
            { cssFiles: [], jsClientFile: null, jsSSRFile: null }
        );

    // TODO: this seems really bad here TBH
    const stringifiedSSRReactApp = require(assets.jsSSRFile.absPath);

    const html = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>The HTML5</title>
            <meta name="description" content="The HTML5 Herald">
            <meta name="author" content="Erwin Gaitan">
            ${assets.cssFiles.map(
                (el) => `<link rel="stylesheet" href="/${el.id}"></link>`
            )}
        </head>
        
        <body>
            <div class="app-root">${stringifiedSSRReactApp.indexPage}</div>
            ${`<script src="/${assets.jsClientFile.id}"></script>`}
        </body>
        </html>
    `;

    fsExtra.outputFileSync(
        path.resolve(webpackConfig.output.path, 'index.html'),
        html,
        { encoding: 'utf8' }
    );
    console.log(html);

    // fsExtra.removeSync(webpackConfig.output.path);
});
