const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')

module.exports = {
  mode: 'none',
  // Entry files for our popup and background pages
  entry: {
    index: './src/index.js',
    options: './src/options.js'
  },
  // Extension will be built into ./dist folder, which we can then load as unpacked extension in Chrome
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  // Here we define loaders for different file types
  module: {
    rules: [
      // We use Babel to transpile JSX
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './src')
        ],
        use: 'babel-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?limit=100000',
          {
            loader: 'img-loader',
            options: {
              enabled: true,
              optipng: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new WriteJsonPlugin({
      object: createManifest(),
      filename: 'manifest.json'
    }),
    // create popup.html from template and inject styles and script bundles
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['options'],
      filename: 'options.html',
      template: './src/options.html'
    }),
    // copy extension manifest and icons
    new CopyWebpackPlugin([
      { context: './src/icons', from: '**', to: 'icons' }
    ])
  ]
}

function createManifest () {
  const manifest = JSON.parse(fs.readFileSync('./src/manifest.json'))
  const packageJson = JSON.parse(fs.readFileSync('./package.json'))

  return Object.assign(manifest, {
    version: packageJson.version,
    description: packageJson.description
  })
}
