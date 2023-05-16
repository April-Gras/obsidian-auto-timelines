import { PluginSettingTab } from "obsidian";

import type { App } from "obsidian";
import type AprilsAutomaticTimelinesPlugin from "~/../main";

import { createApp, ref } from "vue";
import { createI18n } from "vue-i18n";
import VApp from "~/views/App.vue";
//@ts-expect-error
import en from "~/locales/en.json";

import type { AutoTimelineSettings } from "./types";

/**
 * The keys looked for when processing metadata in a single note.
 */
export const DEFAULT_METADATA_KEYS = {
	metadataKeyEventStartDate: "aat-event-start-date",
	metadataKeyEventEndDate: "aat-event-end-date",
	metadataKeyEventTitleOverride: "aat-event-title",
	metadataKeyEventBodyOverride: "aat-event-body",
	metadataKeyEventPictureOverride: "aat-event-picture",
	dateParserRegex: "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
	dateParserGroupPriority: "year,month,day",
	dateDisplayFormat: "{year}/{month}/{day}",
};

export const __VUE_PROD_DEVTOOLS__ = true;
/**
 * Class designed to display the inputs that allow the end user to change the default keys that are looked for when processing metadata in a single note.
 */
export class TimelineSettingTab extends PluginSettingTab {
	plugin: AprilsAutomaticTimelinesPlugin;

	constructor(app: App, plugin: AprilsAutomaticTimelinesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		// TODO Read locale off obsidian.
		const i18n = createI18n({
			locale: "en",
			fallbackLocale: "en",
			messages: {
				en,
			},
			allowComposition: true,
		});

		createApp({
			components: { VApp },
			template: "<VApp :value='value' @update:value='save' />",
			setup: () => {
				const value = ref(this.plugin.settings);
				return {
					value,
					save: async (payload: Partial<AutoTimelineSettings>) => {
						this.plugin.settings = {
							...this.plugin.settings,
							...payload,
						};
						value.value = this.plugin.settings;
						await this.plugin.saveSettings();
					},
				};
			},
			methods: {},
		})
			.use(i18n)
			.mount(this.containerEl);
	}
}
