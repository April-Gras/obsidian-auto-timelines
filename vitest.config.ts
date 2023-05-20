/// <reference types="vitest" />

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import TsConfigPath from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [Vue(), TsConfigPath()],
	test: {
		globals: true,
		environment: "jsdom",
		coverage: {
			provider: "istanbul",
			reporter: ["html"],
		},
	},
});
