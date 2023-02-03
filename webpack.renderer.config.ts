import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins, resolvePlugins } from './webpack.plugins';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

rules.push({
  test: /\.(woff|woff2|svg)$/,
  sideEffects: true,
  type: 'asset/resource'
});

rules.push({
  test: /\.css$/,
  use: [
    { 
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "../",
      }
    },
    'css-loader' 
  ],
});

plugins.push(new MiniCssExtractPlugin({
  filename: 'assets/[name].css', 
}));

if (isDevelopment) {
  plugins.push(new ReactRefreshWebpackPlugin({
    esModule: true,
  }));
}

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  devServer: {
    hot: isDevelopment,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    plugins: resolvePlugins,
  },
  watchOptions: {
    ignored: /node_modules/,
  }
};
