import { MarkdownPostProcessorContext, Plugin } from "obsidian";

import type { AutoTimelineSettings, CompleteCardContext } from "~/types";
import { compareAbstractDates, isDefined, measureTime } from "~/utils";
import { getDataFromNoteMetadata, getDataFromNoteBody } from "~/cardData";
import { setupTimelineCreation } from "~/timelineMarkup";
import { createCardFromBuiltContext } from "~/cardMarkup";
import { getAllRangeData } from "~/rangeData";
import { renderRanges } from "~/rangeMarkup";
import { SETTINGS_DEFAULT, TimelineSettingTab } from "~/settings";
import { parseMarkdownBlockSource } from "./markdownBlockData";

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
		const parserResults = parseMarkdownBlockSource(source);
		const { tagsToFind, settingsOverride } = parserResults;
		const finalSettings = { ...this.settings, ...settingsOverride };
		const creationContext = setupTimelineCreation(
			app,
			element,
			sourcePath,
			finalSettings
		);
		const cardDataTime = measureTime("Data fetch");
		const events: CompleteCardContext[] = [];
		for (const context of creationContext) {
			const baseData = await getDataFromNoteMetadata(context, tagsToFind);

			if (!baseData) continue;
			events.push(baseData);
			if (!finalSettings.allowInlineEventsInNotes) continue;
			const inlineEvents = (
				await getDataFromNoteBody(baseData, tagsToFind)
			).filter(isDefined);
			events.push(...inlineEvents);
		}
		events.sort(
			(
				{ cardData: { startDate: a, endDate: aE } },
				{ cardData: { startDate: b, endDate: bE } }
			) => {
				const score = compareAbstractDates(a, b);

				if (score) return score;
				return compareAbstractDates(aE, bE);
			}
		);
		cardDataTime();

		const cardRenderTime = measureTime("Card Render");
		events.forEach(({ context, cardData }) =>
			createCardFromBuiltContext(context, cardData)
		);
		cardRenderTime();

		const rangeDataFecthTime = measureTime("Range Data");
		const ranges = getAllRangeData(events);
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
			SETTINGS_DEFAULT,
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
