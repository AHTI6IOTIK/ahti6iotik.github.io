const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")


const ENTRY_PATH = path.resolve(__dirname, 'src')
const OUTPUT_PATH = path.resolve(__dirname, './')
const devMode = process.env.NODE_ENV !== 'production';

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
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            minimize: true,
                            url: false
                        }
                    },
                    'postcss-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            presets: ['url-loader'],
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(ENTRY_PATH, 'index.html')
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
}