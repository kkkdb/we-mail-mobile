var path = require('path'),
	webpack = require('webpack')
// npm run dev
module.exports = {
	entry: {
		gd: './src/js/goodsDetail.js',
		gl: './src/js/goodsList.js',
		example: './src/js/example.js'
	},
	output: {
		path: 'dist',
		publicPath: '/dist/',
		filename: '[name].js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015']
			}
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		}, {
			test: /\.vue$/,
			loader: 'vue'
		}
		]
	},
	resolve: {
		extensions: ['', '.js', '.vue', '.css']
	}
};