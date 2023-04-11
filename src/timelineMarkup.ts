import type { MetadataCache, Vault } from "obsidian";
import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

export async function setupTimelineCreation(
	vault: Vault,
	metadataCache: MetadataCache,
	element: HTMLElement
) {
	const fileArray = await Promise.all(vault.getMarkdownFiles());
	const cardListRootElement = element.createDiv();
	const timelineRootElement = element.createDiv();

	element.classList.add("aat-vertical-timeline");
	cardListRootElement.classList.add("aat-card-list-root");
	timelineRootElement.classList.add("aat-timeline-root");
	const dataBundleArray = fileArray.reduce((accumulator, file) => {
		const cachedMetadata = metadataCache.getFileCache(file);

		if (cachedMetadata)
			accumulator.push({
				cachedMetadata,
				file,
				elements: {
					timelineRootElement,
					cardListRootElement,
				},
			});
		return accumulator;
	}, [] as MarkdownCodeBlockTimelineProcessingContext[]);

	return dataBundleArray;
}
