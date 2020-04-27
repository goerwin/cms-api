const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const distFolder = path.resolve(__dirname, '_webpackTempFiles');

function getConfigs(env = 'production') {
    const commonConfig = {
        mode: env,
        devtool: env === 'development' ? 'inline-source-map' : 'none',
        output: {
            path: distFolder,
            filename: '[name].[contenthash].bundle.js',
        },
        resolveLoader: {
            modules: [path.join(__dirname, 'node_modules')],
        },
        resolve: {
            modules: [path.join(__dirname, 'node_modules')],
            extensions: ['.js', '.jsx', '.json'],
        },
        module: {
            rules: [
                {
                    test: /\.jsx$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cwd: __dirname,
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                            ],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: MiniCssExtractPlugin.loader },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    auto: true,
                                    localIdentName:
                                        '[name]__[local]__[contenthash:8]',
                                },
                            },
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(png|jpe?g|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
                chunkFilename: '[id].css',
                ignoreOrder: false,
            }),
        ],
    };

    const serverConfig = {
        ...commonConfig,
        target: 'node',
        entry: {
            index: path.resolve(__dirname, 'indexSSR.jsx'),
        },
        output: {
            ...commonConfig.output,
            libraryTarget: 'commonjs2',
        },
    };

    const clientConfig = {
        ...commonConfig,
        target: 'web',
        entry: {
            index: path.resolve(__dirname, 'indexClient.jsx'),
        },
        output: {
            ...commonConfig.output,
            libraryTarget: undefined,
        },
    };

    return { serverConfig, clientConfig };
}

module.exports = getConfigs;
