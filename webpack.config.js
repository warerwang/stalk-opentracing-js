const path = require('path');

module.exports = [
    {
        target: 'web',
        entry: './src/index.web.ts',
        module: {
            rules: [
                {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        output: {
            library: 'tracing',
            libraryTarget: 'umd',
            filename: 'web.js',
            path: path.resolve(__dirname, 'dist')
        }
    },
    {
        target: 'node',
        entry: './src/index.node.ts',
        module: {
            rules: [
                {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        output: {
            libraryTarget: 'commonjs2',
            filename: 'node.js',
            path: path.resolve(__dirname, 'dist')
        }
    }
];
