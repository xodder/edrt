import Dotenv from 'dotenv-webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export const plugins = [
  new Dotenv({
    systemvars: true,
  }),
];

export const resolvePlugins = [
  new TsconfigPathsPlugin({
    // mainFields: "module",
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  })
];
