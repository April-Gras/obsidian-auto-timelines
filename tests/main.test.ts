import "./obsidianMocks";
import {
	mockGetFileCache,
	mockHTMLElement,
	mockObsidianApp,
	mockTFile,
} from "./obsidianMocks";

import manifest from "~/../manifest.json";
import { SETTINGS_DEFAULT } from "~/settings";

import AprilsAutomaticTimelinesPlugin from "~/main";

import type { Mock } from "vitest";

describe.concurrent("Main", () => {
	test("ok settings call", async () => {
		const app = mockObsidianApp();
		const plugin = new AprilsAutomaticTimelinesPlugin(app, manifest);

		expectTypeOf(plugin).toMatchTypeOf<AprilsAutomaticTimelinesPlugin>();
		let promise = plugin.loadSettings();
		expect(() => promise).not.toThrowError();

		await promise;
		expect(plugin.loadData).toHaveBeenCalledOnce();
		expect(Object.keys(plugin.settings)).toContain("someKey");

		promise = plugin.saveSettings();
		expect(() => promise).not.toThrowError();
		await promise;
		expect(plugin.saveData).toHaveBeenCalledOnce();
	});

	test("ok on/un/load", async () => {
		const app = mockObsidianApp();
		app.metadataCache.getFileCache = mockGetFileCache()
			.mockImplementationOnce(() => ({
				frontmatter: {
					timelines: ["timeline"],
					"aat-render-enabled": true,
					[SETTINGS_DEFAULT.metadataKeyEventStartDate]: 87,
					[SETTINGS_DEFAULT.metadataKeyEventEndDate]: true,
				},
			}))
			.mockImplementationOnce(() => ({
				frontmatter: undefined,
			}));
		const inlineEventFile = mockTFile();

		inlineEventFile.vault.cachedRead = vi.fn(
			async () =>
				"---\n---\n---\nSample file data%%aat-inline-event\naat-event-start-date: 54\naat-event-end-date: true\naat-render-enabled: true\ntimelines: [timeline]\n%%",
		);
		app.vault.getMarkdownFiles = vi.fn(() => [
			mockTFile(),
			mockTFile(),
			mockTFile(),
			inlineEventFile,
		]);
		const plugin = new AprilsAutomaticTimelinesPlugin(app, manifest);
		const spy = vi.spyOn(plugin, "run");

		expect(() => plugin.onunload()).not.toThrowError();

		const promise = plugin.onload();
		expect(() => promise).not.toThrowError();

		await promise;
		expect(plugin.registerMarkdownCodeBlockProcessor).toHaveBeenCalledOnce();

		const { mock } = plugin.registerMarkdownCodeBlockProcessor as Mock;

		expect(mock.lastCall?.[0]).toBe("aat-vertical");
		expect(mock.lastCall?.[1]).toBeTypeOf("function");

		expect(() =>
			mock.lastCall?.[1]("timeline", mockHTMLElement(), {
				sourcePath: "sample",
			}),
		).not.toThrowError();
		expect(spy).toHaveBeenCalledOnce();
	});
});
