import { resolve } from "path";
import { builtinModules } from "node:module";
import { defineConfig, configDefaults } from "vitest/config";
import Vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const prod = mode === "production";

  return {
    plugins: [Vue()],
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
      tsconfigPaths: true,
      alias: {
        vue: "vue/dist/vue.esm-browser.prod.js",
        "vue-i18n": "vue-i18n/dist/vue-i18n.esm-browser.prod.js",
      },
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
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
        treeshake: true,
        transform: {
          target: "es2018",
        },
        output: {
          format: "commonjs",
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
        },
        external: [
          "obsidian",
          "electron",
          "codemirror",
          "@codemirror/autocomplete",
          "@codemirror/closebrackets",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/comment",
          "@codemirror/fold",
          "@codemirror/gutter",
          "@codemirror/highlight",
          "@codemirror/history",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/matchbrackets",
          "@codemirror/panel",
          "@codemirror/rangeset",
          "@codemirror/rectangular-selection",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/stream-parser",
          "@codemirror/text",
          "@codemirror/tooltip",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/lr",
          "@lezer/highlight",
          ...builtinModules,
        ],
      },
    },
  };
});
