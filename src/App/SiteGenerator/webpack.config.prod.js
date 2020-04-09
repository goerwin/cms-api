const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const distFolder = path.resolve(__dirname, '_webpackTempFiles');

module.exports = {
    mode: 'production',
    devtool: 'none',
    entry: {
        indexSSR: path.resolve(__dirname, 'indexSSR.jsx'),
        indexClient: path.resolve(__dirname, 'indexClient.jsx'),
    },
    output: {
        path: distFolder,
        filename: '[name].[contenthash].bundle.js',
        libraryTarget: 'commonjs',
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
    resolve: { extensions: ['.js', '.jsx'] },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].css',
            ignoreOrder: false,
        }),
    ],
};
