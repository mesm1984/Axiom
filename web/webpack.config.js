const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'direct-render.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.web.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', 
              '@babel/preset-react', 
              '@babel/preset-typescript'
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@react-navigation/native': false,
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    fallback: {
      'react-native-screens': false,
      '@react-navigation/native': false,
      '@react-native-community/masked-view': false,
      'react-native-safe-area-context': false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    port: 9000, // Utilisons un port différent
    open: true,
    hot: true
  },
};
