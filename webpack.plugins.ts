import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import Dotenv from 'dotenv-webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new Dotenv({
    systemvars: true,
  }),
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
];

export const resolvePlugins = [
  new TsconfigPathsPlugin({
    // mainFields: "module",
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  })
];
