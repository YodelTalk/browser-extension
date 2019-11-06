const fs = require('fs')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    content_script: './src/content_script.js',
    options: './src/options.js',
    background: './src/background.js',
    helper: './src/helper.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './src')
        ],
        use: 'babel-loader'
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
      { context: './assets', from: '**', to: 'icons' }
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
