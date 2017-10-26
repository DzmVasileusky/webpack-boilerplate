'use strict';

/* Dependencies
***********************************************/
const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');

/* Constants
***********************************************/
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOP = NODE_ENV === 'development';
const PROJECT_NAME = 'MyProject';
const SOURCE_DIR = path.resolve(__dirname, 'src/');
const OUTPUT_DIR = path.resolve(__dirname, 'dist/');

/* Plugins
***********************************************/
const PLUGINS = [];

/* Clean old cache files */
if (!IS_DEVELOP) {
	PLUGINS.push(
		new CleanWebpackPlugin([
			'dist/js/script.*.js',
			'dist/css/styles.*.css'
		], {
			watch: true
		})
	);
}

/* Uglify JS */
if (!IS_DEVELOP) {
	PLUGINS.push(
		new UglifyJSPlugin()
	);
}

/* Extract CSS */
PLUGINS.push(
	new ExtractTextPlugin({
		filename: `css/style${IS_DEVELOP ? '' : '.[chunkhash]'}.css`, // relative path
		allChunks: true
	})
);

/* Minify CSS */
if (!IS_DEVELOP) {
	PLUGINS.push(
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.css$/,
			cssProcessor: require('cssnano')
		})
	);
}

/* Copy static */
PLUGINS.push(
	new CopyWebpackPlugin([
		{
			from: `${SOURCE_DIR}/index.html`,
			to: OUTPUT_DIR
		}
	])
);

/* Process html */
PLUGINS.push(
	new HtmlWebpackPlugin({
		filename: `${OUTPUT_DIR}/index.html`,
		template: `${SOURCE_DIR}/index.html`,
		excludeAssets: [/style.*.css/],
		alwaysWriteToDisk: true
	}),

	new HtmlWebpackHarddiskPlugin(), // to recompile index.html on watch
	new HtmlWebpackExcludeAssetsPlugin() // more configurable assets exclusion
);

/* Generate manifest.json */
PLUGINS.push(
	new ManifestPlugin()
);


/* Config
***********************************************/
const config = {

	/* Paths */
	entry: [
		`${SOURCE_DIR}/js/app.js`,
		`${SOURCE_DIR}/scss/main.scss`
	],
	output: {
		path: `${OUTPUT_DIR}`,
		filename: `js/script${IS_DEVELOP ? '' : '.[chunkhash]'}.js`,
		library: PROJECT_NAME,
		publicPath: ''
	},
	resolve: {
		modules: [
			'node_modules',
			SOURCE_DIR
		],
	},

	/* Dev server */
	devServer: {
		contentBase: OUTPUT_DIR,
		port: 9000,
		compress: false,
		historyApiFallback: true,
		inline: true
		/*hot: true,
		https: false, // true for self-signed, object for cert authority
		noInfo: true, // only errors & warns on hot reload*/
	},


	/*watch: NODE_ENV === 'dev',
	watchOptions: {
		aggregateTimeout: 100
	},

	devtool: NODE_ENV === 'dev' ? 'cheap-inline-module-source-map' : false,*/

	/* Source map */
	devtool: 'source-map',

	/* Plugins */
	plugins: PLUGINS,

	/* Loaders */
	module: {
		rules: [
			// load JS
			{
				test: /\.js?$/,
				loader: 'babel-loader',
				options: {
					presets: [
						['env', {
							sourceMaps: true,
							useBuiltIns: true,
							targets: {
								'browsers': ['ie >= 10']
							}
						}]
					]
				}
			},

			// load CSS
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract({
					use: {
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							sourceMap: true
						}
					}
				})
			},
			// load SASS
			{
				test: /\.(sass|scss)$/,
				loader: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								plugins: () => [ require('autoprefixer')({
									browsers: ['> 1%', 'Android 3', 'last 2 versions', 'Opera 12.1', 'ie 9']
								}) ],
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				})
			}
		]
	}
};

module.exports = config;