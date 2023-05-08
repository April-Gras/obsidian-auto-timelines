import { PluginSettingTab, Setting } from "obsidian";

import type { App } from "obsidian";
import type AprilsAutomaticTimelinesPlugin from "~/../main";

/**
 * The keys looked for when processing metadata in a single note.
 */
export const DEFAULT_METADATA_KEYS = {
	metadataKeyEventStartDate: "aat-event-start-date",
	metadataKeyEventEndDate: "aat-event-end-date",
	metadataKeyEventTitleOverride: "aat-event-title",
	metadataKeyEventBodyOverride: "aat-event-body",
	metadataKeyEventPictureOverride: "aat-event-picture",
	// presetDateFormat: DATE_FORMATS[0] as (typeof DATE_FORMATS)[number],
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
			"metadataKeyEventStartDate"
		);
		this.newKeyChangeSetting(
			"Event end key",
			"The key that determines the end of an event in a note",
			"metadataKeyEventEndDate"
		);
		this.newKeyChangeSetting(
			"Event title override",
			"The key for the title override in each notes metadata",
			"metadataKeyEventTitleOverride"
		);
		this.newKeyChangeSetting(
			"Event image override",
			"The key for the image override in each notes metadata",
			"metadataKeyEventPictureOverride"
		);
		this.newKeyChangeSetting(
			"Event body override",
			"The key for the body override in each notes metadata",
			"metadataKeyEventBodyOverride"
		);

		this.newKeyChangeSetting(
			"Date parser regex",
			"The regex used to parse your date. It needs to include the same amount of capture group as the next setting input. If you're unfamilliar with regexes and / or capture groups I would recommend to stick to the preset.",
			"dateParserRegex"
		);
		this.newKeyChangeSetting(
			"Date parser group priority",
			'No spaces and make sure to separate every entry with a ",". This value is used to order the parsed tokens. For example if your custom regex pulls the year month and day out of a date, the natural order should be "year,month,day". Note that you should have as many entries as your regex has capture groups. See presets for inspiration.',
			"dateParserGroupPriority"
		);
		this.newKeyChangeSetting(
			"Date display format",
			'This is the end format the date should be displayed as in the actual timeline cards. You don\'t actually need to include every parsed member here. Following are previous examples "{year}" is a perfectly acceptable format',
			"dateDisplayFormat"
		);
	}

	private newKeyChangeSetting(
		title: string,
		desc: string,
		key: keyof typeof DEFAULT_METADATA_KEYS
	) {
		return new Setting(this.containerEl)
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

// Unused for now
// const DATE_FORMATS = [
// 	"year-month-day",
// 	"year/month/day",
// 	"year-day-month",
// 	"year/day/month",
// 	"custom",
// ] as const;

// Un-used for now ?
// const DATE_FORMAT_PRESET_VALUES: Record<
// 	Exclude<(typeof DATE_FORMATS)[number], "custom">,
// 	{
// 		dateParserRegex: string;
// 		dateParserGroupPriority: string;
// 		dateDisplayFormat: string;
// 	}
// > = {
// 	"year-month-day": {
// 		dateParserRegex:
// 			"(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
// 		dateParserGroupPriority: "year,month,day",
// 		dateDisplayFormat: "{year}/{month}/{day}",
// 	},
// 	"year-day-month": {
// 		dateParserRegex:
// 			"(?<year>-?[0-9]*)-(?<day>-?[0-9]*)-(?<month>-?[0-9]*)",
// 		dateParserGroupPriority: "year,month,day",
// 		dateDisplayFormat: "{year}/{month}/{day}",
// 	},
// 	"year/day/month": {
// 		dateParserRegex:
// 			"(?<year>-?[0-9]*)/(?<day>-?[0-9]*)/(?<month>-?[0-9]*)",
// 		dateParserGroupPriority: "year,month,day",
// 		dateDisplayFormat: "{year}/{month}/{day}",
// 	},
// 	"year/month/day": {
// 		dateParserRegex:
// 			"(?<year>-?[0-9]*)/(?<month>-?[0-9]*)/(?<day>-?[0-9]*)",
// 		dateParserGroupPriority: "year,month,day",
// 		dateDisplayFormat: "{year}/{month}/{day}",
// 	},
// };
