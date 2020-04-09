const webpack = require('webpack');
// const path = require('path');
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
                if (/.*.js$/.test(asset.id)) {
                    acc.jsFile = asset;
                } else if (/.*.css$/.test(asset.id)) {
                    acc.cssFiles.push(asset);
                }

                return acc;
            },
            { cssFiles: [], jsFile: null }
        );

    // TODO: this seems really bad here TBH
    const stringifiedReactApp = require(assets.jsFile.absPath);

    const html = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>The HTML5</title>
            <meta name="description" content="The HTML5 Herald">
            <meta name="author" content="Erwin Gaitan">
            ${assets.cssFiles.map((el) =>
                `<link rel="stylesheet" href="/${el.id}"></link>`
            )}
        </head>
        
        <body>
            <div class="app-root">${stringifiedReactApp.indexPage}</div>
            ${assets.cssFiles.map((el) =>
                `<script src="${el.id}"></script>`
            )}
        </body>
        </html>
    `;

    // console.log(html);
    // fsExtra.file
    
    fsExtra.removeSync(webpackConfig.output.path);
});
