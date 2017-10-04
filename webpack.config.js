var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/client/main.js',
  output: {
    path: path.resolve(__dirname, './dist/public/client'),
    publicPath: '/dist/public/',
    filename: 'build.js'
  },
  resolve: {
    extensions: ['.js', '.vue', ".ts", ".tsx"],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'public': path.resolve(__dirname, './dist/public')
    }
  },
  module: {
    noParse: [
      /mys-controller.js/,
      /xiaomi-device.js/,
      /request/,
      /child*process/,
      /fs/,
      /net/,
      /system.js/,
      /logplease\/src\/index\.js/
    ],
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
        include: [
          path.resolve(__dirname, "./src/ts2")
        ],
        exclude: [
          path.resolve(__dirname, "../src")
        ],
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    //for hot reloading:
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
