const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// If we want to embed examples in the docusaurus we need the following
// module.exports = function (context, options) {
// return {
//   name: 'custom-docusaurus-plugin',
//   // eslint-disable-next-line
//   configureWebpack(config, isServer, utils) {
//     return {
//       module: {
//         rules: [
//           {
//             test: /\.glsl$/i,
//             include: /vtk\.js[\/\\]Sources/,
//             loader: 'shader-loader',
//           },
//         ],
//       },
//       plugins: [
//         new CopyPlugin({
//           patterns: [
//             {
//               from: '../../node_modules/@alireza-test-monorepo/dicom-image-loader/dist/dynamic-import/',
//             },
//           ],
//         }),
//       ],
//       resolve: {
//         modules: [path.resolve(__dirname, './../node_modules')],
//         extensions: ['.ts', '.tsx', '.js', '.jsx'],
//         fallback: {
//           fs: false,
//           path: require.resolve('path-browserify'),
//         },
//         alias: {
//           '@alireza-test-monorepo/core': path.resolve('../core/src/index'),
//           '@alireza-test-monorepo/tools': path.resolve('../tools/src/index'),
//           '@alireza-test-monorepo/streaming-image-volume-loader': path.resolve(
//             '../streaming-image-volume-loader/src/index'
//           ),
//           // We use this alias and the CopyPlugin to support using the dynamic-import version
//           // of WADO Image Loader
//           '@alireza-test-monorepo/dicom-image-loader': '@alireza-test-monorepo/dicom-image-loader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js',
//         },
//       },
//       devServer: {
//         historyApiFallback: true,
//         headers: {
//           'Cross-Origin-Embedder-Policy': 'require-corp',
//           'Cross-Origin-Opener-Policy': 'same-origin',
//         },
//       },
//     }
//   },
// };
// };

module.exports = function (context, options) {
  return {
    name: 'custom-docusaurus-plugin',
    // eslint-disable-next-line
    configureWebpack(config, isServer, utils) {
      return {
        devServer: {
          historyApiFallback: true,
          headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
          },
        },
      };
    },
  };
};
