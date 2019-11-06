const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
  {
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/server.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
  {
    target: 'node',
    entry: './src/client.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      filename: 'client.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }
];
