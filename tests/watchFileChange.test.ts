import "./obsidianMocks";
import { mockObsidianApp, mockTFile } from "./obsidianMocks";

import { watchFiles } from "~/watchFileChange";

import type { Mock } from "vitest";

describe.concurrent("Watch file change", () => {
	test("[watchFiles] - ok", () => {
		const files = [mockTFile()];
		const app = mockObsidianApp();
		const targetCallback = vi.fn();
		const watcher = watchFiles(app, files, targetCallback);

		expect(() =>
			watchFiles(app, files, vi.fn(), watcher)
		).not.toThrowError();
		expect(app.vault.on).toBeCalledTimes(2);
		expect((app.vault.on as Mock).mock.lastCall[1](files[0])).toBe(true);
		expect((app.vault.on as Mock).mock.lastCall[1](files[0])).toBe(true);
		expect(app.vault.on as Mock).toBeCalledWith(
			"modify",
			(app.vault.on as Mock).mock.lastCall[1]
		);
	});

	test("[watchFiles] - ok - no similar files", () => {
		const app = mockObsidianApp();
		const filesToWatch = [mockTFile()];
		const otherFile = mockTFile();

		otherFile.path = "./otherPath";
		expect(() => watchFiles(app, filesToWatch, vi.fn())).not.toThrowError();
		expect((app.vault.on as Mock).mock.lastCall[1](otherFile)).toBe(false);
	});
});
