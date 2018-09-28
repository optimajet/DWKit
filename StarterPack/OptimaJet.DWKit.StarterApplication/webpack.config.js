var webpack = require('webpack');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

var login = {
    entry: ["babel-polyfill", "./wwwroot/js/app/login.jsx"],
    output: {
        filename: "./wwwroot/js/login.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    presets: ['env', 'stage-2', 'react']
                }
            }
        ]
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            compress: { warnings: false }
        })
    ]
};

var app = {
    entry: ["babel-polyfill", "./wwwroot/js/app/app.jsx"],
    devtool: 'source-map',
    output: {
        filename: "./wwwroot/js/app.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    presets: ['env', 'stage-2', 'react']
                }
            }
        ]
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            compress: { warnings: false }
        })
    ]
};

var admin = {
    entry: ["babel-polyfill", "./wwwroot/js/app/admin.jsx"],
    output: {
        filename: "./wwwroot/js/admin.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    presets: ['env', 'stage-2', 'react']
                }
            }
        ]
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            compress: { warnings: false }
        })
    ]
};

module.exports = [app, admin, login];