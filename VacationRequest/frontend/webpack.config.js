var webpack = require('webpack');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const Dotenv = require('dotenv-webpack');

var config = {
    // TODO: Add common Configuration
    module: {},
    plugins: [new Dotenv()]
};

module.exports = (env) => {
    const isDevBuild = !(env ? env.prod : process.env && process.env.NODE_ENV === "production");

    return [
        Object.assign({}, config, {
            name: "index",
            entry:  "./index.js",
            mode: isDevBuild ? "development" : "production",
          output: {
            filename: "index.js",
            path: __dirname + "/build"
          },
        
          module: {
              rules: [
                  {
                      test: /.jsx?$/, exclude: /node_modules/, use: {
                          loader: 'babel-loader',
                          options: {
                              presets: ['env', 'stage-2', 'react']
                          }
                      }
                  },
                  { test: /\.scss$/, use: "style-loader!css-loader!sass-loader" }
              ]
          },
          resolve: {
            extensions: ['*', '.js', '.json', '.jsx', '.css', '.scss']
          },
          devtool: "inline-source-map",
          devServer: {
            historyApiFallback: {
                index: '/'
            }
         }
        })
    ];
};
