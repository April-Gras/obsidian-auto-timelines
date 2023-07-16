import { PluginSettingTab } from "obsidian";

import { createApp, ref } from "vue";
import createVueI18nConfig from "~/i18n.config";

import VApp from "~/views/App.vue";

import type { App as ObsidianApp } from "obsidian";
import type AprilsAutomaticTimelinesPlugin from "~/main";
import type { AutoTimelineSettings, DateTokenConfiguration } from "./types";
import type { App as VueApp } from "vue";
import { createNumberDateTokenConfiguration } from "./utils";

/**
 * Default key value relation for obsidian settings object
 */
export const SETTINGS_DEFAULT = {
	metadataKeyEventStartDate: "aat-event-start-date",
	metadataKeyEventEndDate: "aat-event-end-date",
	metadataKeyEventTitleOverride: "aat-event-title",
	metadataKeyEventBodyOverride: "aat-event-body",
	metadataKeyEventPictureOverride: "aat-event-picture",
	metadataKeyEventTimelineTag: "timelines",
	noteInlineEventKey: "aat-inline-event",
	markdownBlockTagsToFindSeparator: ",",
	dateParserRegex: "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
	dateParserGroupPriority: "year,month,day",
	dateDisplayFormat: "{day}/{month}/{year}",
	lookForTagsForTimeline: false,
	lookForInlineEventsInNotes: true,
	dateTokenConfiguration: [
		createNumberDateTokenConfiguration({ name: "year", minLeght: 4 }),
		createNumberDateTokenConfiguration({ name: "month" }),
		createNumberDateTokenConfiguration({ name: "day" }),
	] as DateTokenConfiguration[],
};

export const __VUE_PROD_DEVTOOLS__ = true;
/**
 * Class designed to display the inputs that allow the end user to change the default keys that are looked for when processing metadata in a single note.
 */
export class TimelineSettingTab extends PluginSettingTab {
	plugin: AprilsAutomaticTimelinesPlugin;
	vueApp: VueApp<Element> | null;

	constructor(app: ObsidianApp, plugin: AprilsAutomaticTimelinesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.vueApp = null;
	}

	display(): void {
		this.containerEl.empty();

		// TODO Read locale off obsidian.
		const i18n = createVueI18nConfig();

		this.vueApp = createApp({
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
		});

		this.vueApp.use(i18n).mount(this.containerEl);
	}

	hide() {
		if (!this.vueApp) return;
		this.vueApp.unmount();
		this.vueApp = null;
	}
}
