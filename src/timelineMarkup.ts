import type { App } from "obsidian";
import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

/**
 * A preliminary helper to fetch all the needed context to handle the timeline creation.
 *
 * @param { App } app - The app context provided by obsidian.
 * @param { HTMLElement } element - The root element of this timeline.
 * @param timelineFile - The file path of the timeline.
 * @returns { MarkdownCodeBlockTimelineProcessingContext } the nessessary context to build a timeline.
 */
export function setupTimelineCreation(
	app: App,
	element: HTMLElement,
	timelineFile: string
) {
	const { vault, metadataCache } = app;
	const fileArray = vault.getMarkdownFiles();
	const cardListRootElement = element.createDiv();
	const timelineRootElement = element.createDiv();

	element.classList.add("aat-vertical-timeline");
	cardListRootElement.classList.add("aat-card-list-root");
	timelineRootElement.classList.add("aat-timeline-root");
	const dataBundleArray = fileArray.reduce((accumulator, file) => {
		const cachedMetadata = metadataCache.getFileCache(file);

		if (cachedMetadata)
			accumulator.push({
				app,
				timelineFile,
				file,
				cachedMetadata,
				elements: {
					timelineRootElement,
					cardListRootElement,
				},
			});
		return accumulator;
	}, [] as MarkdownCodeBlockTimelineProcessingContext[]);

	return dataBundleArray;
}
