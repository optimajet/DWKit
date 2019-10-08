var webpack = require('webpack');
var glob = require("glob");
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const path = require('path');

const outputDir = './wwwroot/js';

module.exports = (env) => {
    const isDevBuild = !(env ? env.prod : process.env && process.env.NODE_ENV === "production");

    var libs = {
        name: "vendor",
        mode: "production",
        devtool: false,
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                })
            ]
        },
        entry: ["history",
            "isomorphic-fetch",
            "json5",
            "react",
            "react-data-grid",
            "react-dom",
            "react-redux",
            "react-router",
            "react-router-dom",
            "react-router-redux",
            "redux",
            "redux-actions",
            "redux-devtools-extension",
            "redux-thunk",
            "reflux",
            "semantic-ui-react",
            "url",
            "moment",
            "react-dropzone-component",
            "react-datepicker", 
            "react-fast-compare",
            "react-modal",
            "uuid",
            "react-grid-layout",
            "react-slick",
            "numeral",
            "oidc-client",
            "@aspnet/signalr"].concat(glob.sync('./node_modules/semantic-ui-react/dist/es/lib/**.js')), //fix of incorrect sematic-ui import
        output: {
            path: path.join(__dirname, outputDir),
            filename: "vendor.js",
            library: "vendor_[hash]"
        },
        plugins: [
            new webpack.DllPlugin({
                name: "vendor_[hash]",
                path: "./wwwroot/js/manifest.json"
            })
        ]
    };

    var login = {
        entry: ["babel-polyfill", "./wwwroot/js/app/login.jsx"],
        mode: isDevBuild ? "development" : "production",
        output: {
            path: path.join(__dirname, outputDir),
            filename: "login.js"
        },
        dependencies: ["vendor"],
        module: {
            rules: [
                {
                    test: /.jsx?$/, exclude: /node_modules/, use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env', 'stage-2', 'react']
                        }
                    }
                }
            ]
        },
        devtool: "inline-source-map",
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                })
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        plugins: [
            new HardSourceWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(isDevBuild ? "development" : "production")
                }
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.DllReferencePlugin({
                manifest: "./wwwroot/js/manifest.json"
            })
        ]
    };

    var app = {
        entry: ["babel-polyfill", "./wwwroot/js/app/app.jsx"],
        mode: isDevBuild ? "development" : "production",
        output: {
            path: path.join(__dirname, outputDir),
            filename: "app.js"
        },
        dependencies: ["vendor"],
        module: {
            rules: [
                {
                    test: /.jsx?$/, exclude: /node_modules/, use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env', 'stage-2', 'react']
                        }
                    }
                }
            ]
        },
        devtool: "inline-source-map",
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                })
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        plugins: [
            new HardSourceWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(isDevBuild ? "development" : "production")
                }
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.DllReferencePlugin({
                manifest: "./wwwroot/js/manifest.json"
            })
        ]
    };

    var admin = {
        entry: ["babel-polyfill", "./wwwroot/js/app/admin.jsx"],
        mode: isDevBuild ? "development" : "production",
        output: {
            path: path.join(__dirname, outputDir),
            filename: "admin.js"
        },
        dependencies: ["vendor"],
        module: {
            rules: [
                {
                    test: /.jsx?$/, exclude: /node_modules/, use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env', 'stage-2', 'react']
                        }
                    }
                }
            ]
        },
        devtool: "inline-source-map",
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                })
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        plugins: [
            new HardSourceWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(isDevBuild ? "development" : "production")
                }
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.DllReferencePlugin({
                manifest: "./wwwroot/js/manifest.json"
            })
        ]
    };

    return [libs, app, admin, login];
};
