// @ts-check
const lightwing = require('@lightwing/eslint-config').default

module.exports = lightwing(
  {
    ignores: [
      'dist',
      'dist-electron',
      'release',
      'node_modules',
      '*.svelte',
      '*.snap',
      '**/*.d.ts',
      'coverage',
      'js_test',
      'local-data',
    ],
    rules: {
      'no-console': 'off',
    },
  },
)
