const webpack = require('webpack');
const { 
  override, 
  addWebpackModuleRule,
  addBabelPreset 
} = require('customize-cra');

module.exports = override(
  (config) => {
    // Adding fallback for Node.js core modules
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "process": require.resolve("process/browser")
    });
    config.resolve.fallback = fallback;

    // Adding ProvidePlugin for process and Buffer
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]);

    // Adding a new Babel preset
    config.module.rules = config.module.rules.map(rule => {
      if (rule.oneOf) {
        rule.oneOf.unshift({
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'], // Add the new preset here
              // You can add other options as needed
            },
          },
        });
      }
      return rule;
    });

    return config;
  }
);