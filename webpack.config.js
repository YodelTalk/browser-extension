const path = require('path')
const fs = require('fs')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')

module.exports = {
  mode: 'none',
  // Entry files for our popup and background pages
  entry: {
    app: './src/app.js'
  },
  // Extension will be built into ./dist folder, which we can then load as unpacked extension in Chrome
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
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
