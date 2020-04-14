const webpack = require('webpack');
const path = require('path');
const fsExtra = require('fs-extra');
const { createFsFromVolume, Volume } = require('memfs');
const requireFromString = require('require-from-string');
const webpackConfig = require('./webpack.config.prod');
const { getMainHtml } = require('./helpers');
const blog = require('./Themes/Default/sampleData');

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

        // transformations
        blog.metadata.baseUrl = tempDir.replace('/mnt/c/', 'file:///C:/') + '/';
        blog.header = {
            blogAuthor: blog.metadata.author,
            blogUrl: blog.metadata.baseUrl,
            slogan: blog.slogan,
            website: blog.metadata.authorWebsite,
        };

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
                metadata: blog.metadata,
                htmlContent: stringifiedSSRReactApp.getIndexPage(blog),
                cssFilePath: clientAssets.cssFile.id,
                jsFilePath: clientAssets.jsFile.id,
                pageState: JSON.stringify(blog),
                page: 'index',
            }),
            { encoding: 'utf8' }
        );

        // post page
        blog.posts.forEach((post, idx) => {
            const pageState = {
                ...blog,
                ...post,
                previousPost: idx === 0 ? null : blog.posts[idx - 1],
                nextPost:
                    idx === blog.length - 1
                        ? null
                        : blog.posts[idx + 1],
            };

            fsExtra.outputFileSync(
                path.join(tempDir, post.url),
                getMainHtml({
                    metadata: blog.metadata,
                    htmlContent: stringifiedSSRReactApp.getPostPage(pageState),
                    cssFilePath: clientAssets.cssFile.id,
                    jsFilePath: clientAssets.jsFile.id,
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
