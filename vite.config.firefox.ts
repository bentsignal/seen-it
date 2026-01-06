import { resolve } from "path";
import { mergeConfig, defineConfig } from "vite";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import baseConfig, { baseManifest, baseBuildOptions } from "./vite.config.base";

const outDir = resolve(__dirname, "dist/firefox");

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({
        manifest: {
          ...baseManifest,
          background: {
            scripts: ["src/background/index.ts"],
          },
          browser_specific_settings: {
            gecko: {
              id: "{cba53012-7a0d-4559-9bee-c5df54aa0658}",
              strict_min_version: "109.0",
              data_collection_permissions: {
                required: ["none"],
                optional: [],
              },
            },
          },
        } as ManifestV3Export,
        browser: "firefox",
        contentScripts: {
          injectCss: true,
        },
      }),
    ],
    build: {
      ...baseBuildOptions,
      outDir,
    },
  })
);
