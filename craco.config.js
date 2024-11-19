// craco.config.js
const webpack = require('webpack');

module.exports = {
    webpack: {
        alias: {},
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
        configure: (webpackConfig) => {
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                "crypto": require.resolve("crypto-browserify"),
                "stream": require.resolve("stream-browserify"),
                "http": require.resolve("stream-http"),
                "https": require.resolve("https-browserify"),
                "os": require.resolve("os-browserify/browser"),
                "url": require.resolve("url/"),
                "zlib": require.resolve("browserify-zlib"),
                "assert": require.resolve("assert/"),
            };
            return webpackConfig;
        },
    },
};
