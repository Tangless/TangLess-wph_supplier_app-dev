var webpack = require('webpack');
var StringReplacePlugin = require("string-replace-webpack-plugin");
var bundles = require('./webpack.json');
//var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
//var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    //插件项
    plugins: [new StringReplacePlugin()],
    //页面入口文件配置
    entry: bundles.entry,
    //入口文件输出配置
    output: {
        //path: './dist/bundles/',
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        //umdNamedDefine: true
    },
    module: {
        //加载器配置
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' },
            { test: /\.html$/,loader: 'html' }
        ],
    },
    resolve: {
        extensions: ['','.js', '.css', '.scss','.html']
    },
    externals: bundles.externals,
};
