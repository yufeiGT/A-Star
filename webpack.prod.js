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
        Vue: 'vue',
        merge: '@~crazy/merge',
        elementResizeDetectorMaker: 'element-resize-detector',
    },
});