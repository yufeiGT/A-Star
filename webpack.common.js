const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    resolve: {
        alias: {
            'astar': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [{
                test: /\.vue$/,
                use: 'vue-loader',
            }, {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.(jpg|jepg|png|gif)$/,
                use: 'file-loader',
            }, 
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    }
                }
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name]-[hash:5].min.[ext]',
                        limit: 5000,
                        // publicPath: '../static/fonts/',
                        // outputPath: 'fonts/',
                    },
                }],
            }
        ],
    },
};