import { Plugin } from "obsidian";

import type { AutoTimelineSettings } from "~/types";
import { isDefined } from "~/utils";
import { getDataFromNote } from "~/cardData";
import { setupTimelineCreation } from "~/timelineMarkup";
import { createCardFromBuiltContext } from "~/cardMarkup";

const DEFAULT_SETTINGS: AutoTimelineSettings = {};

export default class MyPlugin extends Plugin {
	settings: AutoTimelineSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"aat-vertical",
			async (source, element, _ctx) => {
				console.time("[April's auto-timeline plugin] - Run time");
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

				console.time("[April's auto-timeline plugin] - Data fetch");
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
							if (a === undefined && b === undefined) return 0;
							if (a === undefined) return 1;
							if (b === undefined) return -1;
							return a - b;
						}
					);
				console.timeEnd("[April's auto-timeline plugin] - Data fetch");

				console.time("[April's auto-timeline plugin] - Render");
				cards.forEach(({ context, cardData }) =>
					createCardFromBuiltContext(context, cardData)
				);
				console.timeEnd("[April's auto-timeline plugin] - Render");
				console.timeEnd("[April's auto-timeline plugin] - Run time");
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
