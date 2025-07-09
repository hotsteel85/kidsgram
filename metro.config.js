const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 번들 크기 최적화
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 불필요한 파일 제외
config.resolver.blockList = [
  /.*\/node_modules\/.*\/node_modules\/react-native\/.*/,
];

// 이미지 최적화
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config; 