const path = require('path');
const distFolder = path.resolve('dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',

    devServer: {
        contentBase: distFolder,
        historyApiFallback: {
            disableDotRule: true,
        },
    },

    entry: {
        index: path.resolve(__dirname, 'Themes/index.jsx'),
    },

    output: {
        path: distFolder,
        filename: '[name].bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                auto: true,
                                localIdentName: '[name]__[local]__[contenthash:8]'
                            },
                        },
                    },
                ]
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

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'template.html'),
        }),
    ],
};
