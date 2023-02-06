import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import webpack from 'webpack';

export const plugins = [
  new Dotenv({
    systemvars: true,
  }),
  new webpack.ProvidePlugin({
    React: 'react',
  }),
];

export const resolvePlugins = [
  new TsconfigPathsPlugin({
    // mainFields: "module",
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  }),
];
