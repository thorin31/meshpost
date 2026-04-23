module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@modules': './src/modules',
          '@screens': './src/screens',
          '@store': './src/store',
          '@utils': './src/utils',
          '@components': './src/components',
        },
      },
    ],
  ],
};
