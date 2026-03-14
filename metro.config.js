const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// punycode was removed from Node 22, polyfill it for react-native-markdown-display
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  punycode: require.resolve('punycode'),
};

module.exports = config;
