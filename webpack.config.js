var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: [
    //live reload
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    //app
    './src/client/main.js'
  ],
  output: {
    path: path.resolve(__dirname, './dist/public/client'),
    publicPath: '/client',
    filename: 'build.js'
  },
  resolve: {
    extensions: ['.js', '.vue', ".ts", ".tsx"],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'public': path.resolve(__dirname, './dist/public'),
      //using ES5 version for prevent webpack compile ES6 error
      'logplease': 'logplease/es5/index.js',
      //ignore server-side modules, not used in client-side
      'child_process': 'empty-module',
      'fs': 'empty-module',
      'mqtt': 'empty-module',
      'split': 'empty-module',
      'miio': 'empty-module',
      'request': 'empty-module',
      'serialport': 'empty-module',
      '': 'empty-module',
      '': 'empty-module',

    }
  },
  module: {
    // noParse: [

    // ],
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          objectAssign: 'Object.assign'
        }
      },
      {
        test: /\.styl$/,
        loader: ['style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    //live reload
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
