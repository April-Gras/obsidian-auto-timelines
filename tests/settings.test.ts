import "./obsidianMocks";

import { vi } from "vitest";
import { TimelineSettingTab } from "~/settings";
import AprilsAutomaticTimelinesPlugin from "~/main";
import manifest from "~/../manifest.json";

import { mockObsidianApp } from "./obsidianMocks";

vi.mock("vue", async () => {
	const actual = (await vi.importActual("vue")) as Record<string, unknown>;

	return {
		...actual,
		createApp: vi.fn(
			(context: { setup: () => Record<string, unknown> }) => {
				const e = context.setup();

				for (const index in e) {
					const n = e[index];
					if (typeof n === "function") n();
				}
				return {
					use: vi.fn(() => ({
						mount: vi.fn(),
					})),
					unmount: vi.fn(),
				};
			}
		),
		ref: vi.fn(<T>(value: T) => ({ value })),
	};
});

vi.mock("vue-i18n", () => {
	return {
		createI18n: () => ({}),
	};
});

describe.concurrent("Settings", () => {
	test("Can spawn setting tab", () => {
		const app = mockObsidianApp();
		const plugin = new AprilsAutomaticTimelinesPlugin(app, manifest);
		const tab = new TimelineSettingTab(app, plugin);

		expect(tab.vueApp).toBeNull();
		tab.display();
		expect(tab.vueApp).not.toBeUndefined();
		tab.hide();
		expect(tab.vueApp).toBeNull();
		tab.hide();
		expect(tab.vueApp).toBeNull();
	});
});
