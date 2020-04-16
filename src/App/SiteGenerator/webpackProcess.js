const webpack = require('webpack');
const path = require('path');
const fsExtra = require('fs-extra');
const { createFsFromVolume, Volume } = require('memfs');
const requireFromString = require('require-from-string');
const webpackConfig = require('./webpack.config.prod');
const helpers = require('./helpers');
const blog = require('./Themes/sampleData');

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
        const parsedBlog = helpers.getParsedBlog(blog);

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
            helpers.getMainHtml({
                metadata: parsedBlog.metadata,
                htmlContent: stringifiedSSRReactApp.getIndexPage(parsedBlog),
                cssFilePath: clientAssets.cssFile.id,
                jsFilePath: clientAssets.jsFile.id,
                pageState: JSON.stringify(parsedBlog),
                page: 'index',
            }),
            { encoding: 'utf8' }
        );

        // post page
        parsedBlog.posts.forEach((post) => {
            fsExtra.outputFileSync(
                path.join(tempDir, post.url),
                helpers.getMainHtml({
                    metadata: post.metadata,
                    htmlContent: stringifiedSSRReactApp.getPostPage(post),
                    cssFilePath: clientAssets.cssFile.id,
                    jsFilePath: clientAssets.jsFile.id,
                    pageState: JSON.stringify(post),
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
