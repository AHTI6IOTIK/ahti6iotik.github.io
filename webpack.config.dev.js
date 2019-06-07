const path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    webpack = require('webpack'),
    ENTRY_PATH = path.resolve(__dirname, 'src'),
    OUTPUT_PATH = path.resolve(__dirname, './')

module.exports = {
    mode: 'production',
    entry: ['babel-polyfill', path.resolve(ENTRY_PATH, 'index.js')],
    output: {
        path: OUTPUT_PATH,
        filename: 'bundle.js',
        sourceMapFilename: "bundle.map",
        publicPath: '/'
    },
    devServer: {
        port: 3030,
        contentBase: OUTPUT_PATH,
        compress: true,
        open: true,
        historyApiFallback: true
    },
    devtool: "#source-map",
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
                test: /\.(s|c)ss$/,
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