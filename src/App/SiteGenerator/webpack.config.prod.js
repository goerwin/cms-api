const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const distFolder = path.resolve(__dirname, '_webpackTempFiles');

const commonConfig = {
    mode: 'development',
    devtool: 'none',
    output: {
        path: distFolder,
        filename: '[name].[contenthash].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.s?css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    'css-loader',
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
    resolve: { extensions: ['.js', '.jsx', '.json'] },
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
        libraryTarget: 'commonjs2'
    }
};

const clientConfig = {
    ...commonConfig,
    target: 'web',
    entry: {
        index: path.resolve(__dirname, 'indexClient.jsx'),
    },
    output: {
        ...commonConfig.output,
        libraryTarget: undefined
    }
};

module.exports = [serverConfig, clientConfig];
