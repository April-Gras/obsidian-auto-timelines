import { Plugin } from "obsidian";

import type { AutoTimelineSettings } from "~/types";
import { isDefined, measureTime } from "~/utils";
import { getDataFromNote } from "~/cardData";
import { setupTimelineCreation } from "~/timelineMarkup";
import { createCardFromBuiltContext } from "~/cardMarkup";
import { getAllRangeData } from "~/rangeData";
import { renderRanges } from "~/rangeMarkup";

const DEFAULT_SETTINGS: AutoTimelineSettings = {};

export default class MyPlugin extends Plugin {
	settings: AutoTimelineSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"aat-vertical",
			async (source, element, _ctx) => {
				const runtimeTime = measureTime("Run time");
				const {
					app: { vault, metadataCache },
				} = this;
				// Find what tags we need
				const tagsToFind = source.split(" ");
				const creationContext = await setupTimelineCreation(
					vault,
					metadataCache,
					element
				);

				const cardDataTime = measureTime("Data fetch");
				const cards = (
					await Promise.all(
						creationContext.map((e) =>
							getDataFromNote(e, tagsToFind)
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
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
