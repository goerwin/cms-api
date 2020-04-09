const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

const distFolder = path.resolve('dist');
const OBJECT = 'object';
const ARRAY = 'array';

function insertIf(condition, type, element) {
    if (type === ARRAY) {
        return condition ? [element] : [];
    } else if (type === OBJECT) {
        return condition ? element : {};
    }

    return null;
}

module.exports = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'inline-source-map',

    devServer: {
        contentBase: distFolder,
    },

    entry: {
        index: path.resolve(__dirname, 'index.jsx'),
    },

    output: {
        path: distFolder,
        filename: isProd
            ? '[name].[contenthash].bundle.js'
            : '[name].bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.s?css$/,
                use: [
                    ...insertIf(!isProd, ARRAY, 'style-loader'),
                    ...insertIf(isProd, ARRAY, {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // you can specify a publicPath here
                            // by default it uses publicPath in webpackOptions.output
                            // publicPath: '../',
                            // hmr: process.env.NODE_ENV === 'development',
                        },
                    }),
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
                            name: isProd
                                ? '[name].[contenthash].[ext]'
                                : '[name].[ext]',
                        },
                    },
                ],
            },
        ],
    },

    resolve: {
        extensions: ['.js', '.jsx'],
    },

    plugins: [
        ...insertIf(
            isProd,
            ARRAY,
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
                chunkFilename: '[id].css',
                ignoreOrder: false,
            })
        ),
    ],
};
