import { MarkdownPostProcessorContext, Plugin } from "obsidian";

import type { AutoTimelineSettings } from "~/types";
import { isDefined, measureTime } from "~/utils";
import { getDataFromNote } from "~/cardData";
import { setupTimelineCreation } from "~/timelineMarkup";
import { createCardFromBuiltContext } from "~/cardMarkup";
import { getAllRangeData } from "~/rangeData";
import { renderRanges } from "~/rangeMarkup";
import { DEFAULT_METADATA_KEYS, TimelineSettingTab } from "~/settings";
export default class AprilsAutomaticTimelinesPlugin extends Plugin {
	settings: AutoTimelineSettings;

	/**
	 * The default onload method of a obsidian plugin
	 * See the official documentation for more details
	 */
	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"aat-vertical",
			(source, element, context) => {
				this.run(source, element, context);
			}
		);
	}

	onunload() {}

	/**
	 * Main runtime function to process a single timeline.
	 *
	 * @param { string } source - The content found in the markdown block.
	 * @param { HTMLElement } element - The root element of all the timeline.
	 * @param { MarkdownPostProcessorContext } param2 - The context provided by obsidians `registerMarkdownCodeBlockProcessor()` method.
	 */
	async run(
		source: string,
		element: HTMLElement,
		{ sourcePath }: MarkdownPostProcessorContext
	) {
		const runtimeTime = measureTime("Run time");
		const { app } = this;
		const tagsToFind = source.split(" ").map((e) => e.replace("\n", ""));
		const creationContext = setupTimelineCreation(app, element, sourcePath);
		const cardDataTime = measureTime("Data fetch");
		const cards = (
			await Promise.all(
				creationContext.map((e) =>
					getDataFromNote(e, tagsToFind, this.settings)
				)
			)
		)
			.filter(isDefined)
			.sort(
				(
					{ cardData: { startDate: a } },
					{ cardData: { startDate: b } }
				) => {
					// Since these are numbers we can't check with `!`
					if (!isDefined(a) && !isDefined(b)) return 0;
					if (!isDefined(a)) return 1;
					if (!isDefined(b)) return -1;
					return a - b;
				}
			);
		cardDataTime();

		const cardRenderTime = measureTime("Card Render");
		cards.forEach(({ context, cardData }) =>
			createCardFromBuiltContext(context, cardData)
		);
		cardRenderTime();

		const rangeDataFecthTime = measureTime("Range Data");
		const ranges = getAllRangeData(cards);
		rangeDataFecthTime();

		const rangeRenderTime = measureTime("Range Render");
		renderRanges(ranges, element);
		rangeRenderTime();

		runtimeTime();
	}

	/**
	 * Loads the saved settings from the local device and sets up the setting tabs in the plugin options.
	 */
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_METADATA_KEYS,
			await this.loadData()
		);

		this.addSettingTab(new TimelineSettingTab(this.app, this));
	}

	/**
	 * Saves the settings in obsidian.
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
