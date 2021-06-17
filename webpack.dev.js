const path = require('path');
const {
	merge,
} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	resolve: {
		alias: {
			'@Dev': path.resolve(__dirname, 'dev'),
			'astar': path.resolve(__dirname, 'src'),
		},
	},
	devtool: 'inline-source-map',
	entry: {
		app: './dev/index.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './dev/index.html',
		}),
	],
	output: {
		filename: '[name].[hash:8].js',
		path: path.resolve(__dirname, 'dist'),
	},
	devServer: {
		host: '0.0.0.0',
	},
});