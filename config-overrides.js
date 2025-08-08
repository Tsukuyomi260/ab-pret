const webpack = require('webpack');

module.exports = function override(config, env) {
  // Ensure resolve.fallback exists
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }

  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "util": require.resolve("util/"),
    "buffer": require.resolve("buffer"),
    "process": require.resolve("process/browser"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "url": require.resolve("url/"),
    "querystring": require.resolve("querystring-es3"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "net": false,
    "tls": false,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "assert": require.resolve("assert/"),
    "os": require.resolve("os-browserify/browser"),
    "constants": require.resolve("constants-browserify"),
  };

  // Ensure plugins array exists
  if (!config.plugins) {
    config.plugins = [];
  }

  // Add plugins for global variables
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Add node polyfills
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    })
  );

  // Fix for canvg and other modules that need process/browser
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser'),
  };

  // Handle ES modules properly
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  // Add resolve extensions
  if (!config.resolve.extensions) {
    config.resolve.extensions = [];
  }
  config.resolve.extensions.push('.mjs', '.js');

  // Fix for canvg ES module issues
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser'),
  };

  // Configure module resolution for ES modules
  config.resolve.extensionAlias = {
    '.js': ['.js', '.mjs'],
    '.mjs': ['.mjs', '.js']
  };

  // Handle canvg specifically
  config.module.rules.push({
    test: /node_modules\/canvg/,
    type: 'javascript/auto'
  });

  return config;
};
