const path = require('path');
const {
    merge,
} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'astar.js',
        path: path.resolve(__dirname, 'dist'),
        libraryExport: 'default',
        library: 'AStar',
        libraryTarget: 'umd',
    },
    externals: {
        '@~crazy/merge': {
            commonjs: '@~crazy/merge',
            commonjs2: '@~crazy/merge',
            amd: '@~crazy/merge',
            root: 'Merge',
        },
    },
});