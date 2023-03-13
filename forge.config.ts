import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const appName = process.platform === 'linux' ? 'edrt' : 'Edrt';

const config: ForgeConfig = {
  packagerConfig: {
    name: appName,
    // icon: './src/icon',
    executableName: appName,
    asar: false,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
    new MakerDMG({ format: 'ULFO' }),
  ],
  plugins: [
    new WebpackPlugin({
      devServer: {
        liveReload: false,
      },
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: 'main_window',
            html: './src/renderer/index.html',
            js: './src/renderer/index.tsx',
            preload: {
              js: './src/renderer/preload.ts',
            },
          },
        ],
      },
      loggerPort: 9001,
    }),
  ],
};

/**
 * This function inserts config for notarizing applications.
 * Idea stolen from: https://github.com/electron/fiddle/blob/master/forge.config.js
 */
function notarizeMaybe() {
  // GUARD: Only notarize macOS-based applications
  if (process.platform !== 'darwin') {
    return;
  }

  // Only notarize in CI
  if (!process.env.CI) {
    console.log(`Not in CI, skipping notarization`);
    return;
  }

  // GUARD: Credentials are required
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn(
      'Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!'
    );
    return;
  }

  // Inject the notarization config if everything is right
  config.packagerConfig.osxNotarize = {
    tool: 'notarytool',
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: 'L6F68FB49W',
  };

  // Also inject signing config
  config.packagerConfig.osxSign = {
    identity: 'Apple Development: odebiyistephen@gmail.com (L6F68FB49W)',
  };
}

notarizeMaybe();

export default config;
