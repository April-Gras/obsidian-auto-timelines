import { PluginSettingTab, Setting } from "obsidian";

import type { App } from "obsidian";
import type AprilsAutomaticTimelinesPlugin from "~/../main";

/**
 * The keys looked for when processing metadata in a single note.
 */
export const DEFAULT_METADATA_KEYS = {
	metadataKey: {
		eventStartDate: "aat-event-start-date",
		eventEndDate: "aat-event-end-date",
		eventTitleOverride: "aat-event-title",
		eventBodyOverride: "aat-event-body",
		eventPictureOverride: "aat-event-picture",
	},
	dateParserRegex: "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
	dateParserGroupPriority: "year,month,day",
	dateDisplayFormat: "{year}/{month}/{day}",
};

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
		this.newKeyChangeSetting(
			"Event start key",
			"The key that determines the start of an event in a note",
			"eventStartDate"
		);
		this.newKeyChangeSetting(
			"Event end key",
			"The key that determines the end of an event in a note",
			"eventEndDate"
		);
		this.newKeyChangeSetting(
			"Event title override",
			"The key for the title override in each notes metadata",
			"eventTitleOverride"
		);
		this.newKeyChangeSetting(
			"Event image override",
			"The key for the image override in each notes metadata",
			"eventPictureOverride"
		);
		this.newKeyChangeSetting(
			"Event body override",
			"The key for the body override in each notes metadata",
			"eventBodyOverride"
		);
	}

	private newKeyChangeSetting(
		title: string,
		desc: string,
		key: keyof (typeof DEFAULT_METADATA_KEYS)["metadataKey"]
	) {
		new Setting(this.containerEl)
			.setName(title)
			.setDesc(desc)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_METADATA_KEYS.metadataKey[key])
					.setValue(this.plugin.settings.metadataKey[key])
					.onChange(async (value) => {
						this.plugin.settings.metadataKey[key] = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
