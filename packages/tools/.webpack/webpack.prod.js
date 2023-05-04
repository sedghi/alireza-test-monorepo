const { merge } = require('webpack-merge');
const path = require('path');
const webpackCommon = require('./../../../.webpack/webpack.common.js');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
const pkg = require('./../package.json');

module.exports = (env, argv) => {
  const commonConfig = webpackCommon(env, argv);

  return merge(commonConfig, {
    devtool: 'source-map',
    entry: {
      lib: path.join(__dirname, '../src/index.ts'),
    },
    output: {
      path: path.join(__dirname, '../dist/umd'),
      library: 'cornerstoneTools3D',
      libraryTarget: 'umd',
      filename: 'index.js',
    },
    stats: {
      colors: true,
      hash: true,
      timings: true,
      assets: true,
      chunks: false,
      chunkModules: false,
      modules: false,
      children: false,
      warnings: true,
    },
    optimization: {
      minimize: true,
    },
    externals: [
      {
        '@alireza-test-monorepo/core': {
          root: 'cornerstone3D',
          commonjs: '@alireza-test-monorepo/core',
          commonjs2: '@alireza-test-monorepo/core',
          amd: '@alireza-test-monorepo/core',
        },
        '@alireza-test-monorepo/streaming-image-volume-loader': {
          root: 'cornerstoneStreamingImageVolumeLoader',
          commonjs: '@alireza-test-monorepo/streaming-image-volume-loader',
          commonjs2: '@alireza-test-monorepo/streaming-image-volume-loader',
          amd: '@alireza-test-monorepo/streaming-image-volume-loader',
        },
        'gl-matrix': {
          root: 'window',
          commonjs: 'gl-matrix',
          commonjs2: 'gl-matrix',
          amd: 'gl-matrix',
        },
      },
    ],

    // plugins: [new webpackBundleAnalyzer.BundleAnalyzerPlugin()],
  });
};
