const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'web/index.js'),
  output: {
    filename: 'bundle.web.js',
    path: path.join(__dirname, 'web/dist'),
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
              '@babel/preset-typescript',
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
      '@react-navigation/native': 'react-native-web', // Ignorer les imports de react-navigation
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    fallback: {
      'react-native-screens': false,
      '@react-navigation/native': false,
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    port: 8080,
  },
};
