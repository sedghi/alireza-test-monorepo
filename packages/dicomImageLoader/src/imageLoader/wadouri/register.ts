import * as cornerstoneImport from '@alireza-test-monorepo/core';
import { loadImage } from './loadImage';
import { metaDataProvider } from './metaData/index';

export default function (cornerstone: typeof cornerstoneImport): void {
  // register dicomweb and wadouri image loader prefixes
  cornerstone.registerImageLoader('dicomweb', loadImage);
  cornerstone.registerImageLoader('wadouri', loadImage);
  cornerstone.registerImageLoader('dicomfile', loadImage);

  // add wadouri metadata provider
  cornerstone.metaData.addProvider(metaDataProvider);
}
