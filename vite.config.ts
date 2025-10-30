import { resolve } from "path";
import builtins from "builtin-modules";
import { defineConfig, configDefaults } from "vitest/config";
import Vue from "@vitejs/plugin-vue";
import TsConfigPath from "vite-tsconfig-paths";

// @ts-expect-error IDK some plugin not acting nice
export default defineConfig(({ mode }) => {
  const prod = mode === "production";

  return {
    plugins: [Vue(), TsConfigPath()],
    test: {
      globals: true,
      environment: "happy-dom",
      testTimeout: 50_000,
      coverage: {
        exclude: [
          ...configDefaults.exclude,
          "**/components/*",
          "**/composable/*",
          "**/views/*",
          "**/tests/*",
        ],
        include: ["**/src/*"],
        provider: "v8",
        reporter: ["html"],
      },
    },
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js",
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/main.ts"),
        name: "main",
        fileName: () => "main.js",
        formats: ["cjs"],
      },
      minify: prod,
      sourcemap: prod ? false : "inline",
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: "",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/main.ts"),
        },
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
        },
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtins,
        ],
      },
    },
  };
});
