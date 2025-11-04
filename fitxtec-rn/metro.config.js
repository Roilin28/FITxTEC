const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add 'cjs' to the source extensions to handle CommonJS modules
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;

