const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const ENTRY_PATH = path.resolve(__dirname, 'src')
const OUTPUT_PATH = path.resolve(__dirname, './')

module.exports = {
    mode: 'production',
    entry: ['babel-polyfill', path.resolve(ENTRY_PATH, 'index.js')],
    output: {
        path: OUTPUT_PATH,
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        port: 3030,
        contentBase: OUTPUT_PATH,
        compress: true,
        open: true,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(ENTRY_PATH, 'index.html')
        }),

    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'stage-2', 'react']
                    },
                }
            },
            {
                test: /\.scss$/,
                loader: [
                    // fallback to style-loader in development
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }
        ]
    }
}