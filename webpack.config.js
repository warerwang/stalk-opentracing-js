const path = require('path');

module.exports = [
    {
        target: 'web',
        entry: './src/index.ts',
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
            library: 'StalkOpentracing',
            libraryTarget: 'umd',
            filename: 'web.js',
            path: path.resolve(__dirname, 'dist')
        }
    },
    {
        target: 'node',
        entry: './src/index.ts',
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
