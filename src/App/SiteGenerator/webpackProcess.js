const webpack = require('webpack');
const path = require('path');
const fsExtra = require('fs-extra');
const { createFsFromVolume, Volume } = require('memfs');
const requireFromString = require('require-from-string');
const webpackConfig = require('./webpack.config.prod');
const { getMainHtml } = require('./helpers');
const dummyData = require('./Themes/Default/sampleData');

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

const memfs = createFsFromVolume(new Volume());
memfs.join = path.join;

const webpackCompiler = webpack(webpackConfig);

webpackCompiler.outputFileSystem = memfs;

webpackCompiler.run((err, multistats) => {
    if (err || multistats.hasErrors()) {
        throw err;
    }

    try {
        const serverAssets = getParsedAsset(multistats.stats[0]);
        const clientAssets = getParsedAsset(multistats.stats[1]);
        const tempDir = path.join(__dirname, '/_temp');

        fsExtra.removeSync(tempDir);

        fsExtra.outputFileSync(
            path.join(tempDir, clientAssets.jsFile.id),
            clientAssets.jsFile.asset.source(),
            { encoding: 'utf8' }
        );

        fsExtra.outputFileSync(
            path.join(tempDir, clientAssets.cssFile.id),
            clientAssets.cssFile.asset.source(),
            { encoding: 'utf8' }
        );

        const stringifiedSSRReactApp = requireFromString(
            serverAssets.jsFile.asset.source()
        );

        // index page
        fsExtra.outputFileSync(
            path.join(tempDir, 'index.html'),
            getMainHtml({
                htmlContent: stringifiedSSRReactApp.getIndexPage(dummyData),
                cssFilePath: `/${clientAssets.cssFile.id}`,
                jsFilePath: `/${clientAssets.jsFile.id}`,
                pageState: JSON.stringify(dummyData),
                page: 'index',
            }),
            { encoding: 'utf8' }
        );

        // post pages
        dummyData.posts.forEach((post) => {
            const pageState = { ...dummyData, ...dummyData.posts[0] };

            fsExtra.outputFileSync(
                path.join(tempDir, `${post.url}.html`),
                getMainHtml({
                    htmlContent: stringifiedSSRReactApp.getPostPage(pageState),
                    cssFilePath: `/${clientAssets.cssFile.id}`,
                    jsFilePath: `/${clientAssets.jsFile.id}`,
                    pageState: JSON.stringify(pageState),
                    page: 'post',
                }),
                { encoding: 'utf8' }
            );
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
});
