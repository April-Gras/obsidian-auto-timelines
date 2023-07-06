/// <reference types="vitest" />

import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import Vue from "@vitejs/plugin-vue";
import TsConfigPath from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [Vue(), TsConfigPath()],
	test: {
		globals: true,
		environment: "happy-dom",
		coverage: {
			exclude: [
				...configDefaults.exclude,
				"**/components/*",
				"**/composable/*",
				"**/views/*",
				"**/tests/*",
			],
			provider: "istanbul",
			reporter: ["html"],
		},
	},
});
