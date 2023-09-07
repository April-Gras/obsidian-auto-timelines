import { type EventRef, MarkdownPostProcessorContext, Plugin } from "obsidian";

import type { AutoTimelineSettings, CompleteCardContext } from "~/types";
import { compareAbstractDates, isDefined, measureTime } from "~/utils";
import { getDataFromNoteMetadata, getDataFromNoteBody } from "~/cardData";
import { setupTimelineCreation } from "~/timelineMarkup";
import { createCardFromBuiltContext } from "~/cardMarkup";
import { getAllRangeData } from "~/rangeData";
import { renderRanges } from "~/rangeMarkup";
import { SETTINGS_DEFAULT, TimelineSettingTab } from "~/settings";
import { parseMarkdownBlockSource } from "./markdownBlockData";
import { watchFiles } from "./watchFileChange";

export default class AprilsAutomaticTimelinesPlugin extends Plugin {
	settings: AutoTimelineSettings;
	/**
	 * Native file watcher that triggers on file edit and re-renders timelines
	 */
	fileWatcher: EventRef | null;

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

	onunload() {
		if (this.fileWatcher) this.app.vault.offref(this.fileWatcher);
	}

	/**
	 * Main runtime function to process a single timeline.
	 *
	 * @param source - The content found in the markdown block.
	 * @param element - The root element of all the timeline.
	 * @param param2 - The context provided by obsidians `registerMarkdownCodeBlockProcessor()` method.
	 * @param param2.sourcePath - A string representing the fs path of a note.
	 */
	async run(
		source: string,
		element: HTMLElement,
		{ sourcePath }: Pick<MarkdownPostProcessorContext, "sourcePath">
	) {
		element.empty();
		const runtimeTime = measureTime("Run time");
		const { app } = this;
		const { tagsToFind, settingsOverride } =
			parseMarkdownBlockSource(source);
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

			if (isDefined(baseData)) events.push(baseData);
			if (!finalSettings.lookForInlineEventsInNotes) continue;
			const body =
				baseData?.cardData.body ||
				(await context.file.vault.cachedRead(context.file));
			const inlineEvents = (
				await getDataFromNoteBody(body, context, tagsToFind)
			).filter(isDefined);

			if (!inlineEvents.length) continue;
			events.push(...inlineEvents);
		}
		events.sort(
			(
				{ cardData: { startDate: a, endDate: aE, title: titleA } },
				{ cardData: { startDate: b, endDate: bE, title: titleB } }
			) => {
				return (
					compareAbstractDates(a, b) ||
					compareAbstractDates(aE, bE) ||
					titleA.localeCompare(titleB)
				);
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

		const watcherSetupTime = measureTime("File change watcher setup");
		this.fileWatcher = watchFiles(
			this.app,
			events.map(({ context: { file } }) => file),
			() => this.run(source, element, { sourcePath }),
			this.fileWatcher
		);
		watcherSetupTime();
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

		for (
			let index = 0;
			index < this.settings.dateTokenConfiguration.length;
			index++
		) {
			this.settings.dateTokenConfiguration[index].formatting =
				this.settings.dateTokenConfiguration[index].formatting || [];
		}
		this.addSettingTab(new TimelineSettingTab(this.app, this));
	}

	/**
	 * Saves the settings in obsidian.
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
