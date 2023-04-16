import { PluginSettingTab, Setting } from "obsidian";

import type { App } from "obsidian";
import type AprilsAutomaticTimelinesPlugin from "~/../main";

export const DEFAULT_METADATA_KEYS = {
	eventStartDate: "aat-event-start-date",
	eventEndDate: "aat-event-end-date",
	eventTitleOverride: "aat-event-title",
	eventBodyOverride: "aat-event-body",
	eventPictureOverride: "aat-event-picture",
};

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
		key: keyof typeof DEFAULT_METADATA_KEYS
	) {
		new Setting(this.containerEl)
			.setName(title)
			.setDesc(desc)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_METADATA_KEYS[key])
					.setValue(this.plugin.settings[key])
					.onChange(async (value) => {
						this.plugin.settings[key] = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
