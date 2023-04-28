import { DEFAULT_METADATA_KEYS } from "~/settings";
import { FnGetRangeData } from "./rangeData";
import { FnExtractCardData, getDataFromNote } from "~/cardData";

import type { App, CachedMetadata, TFile } from "obsidian";
export type AutoTimelineSettings = typeof DEFAULT_METADATA_KEYS;
/**
 * The main bundle of data needed to build a timeline.
 */
export interface MarkdownCodeBlockTimelineProcessingContext {
	/**
	 * Obsidian application context.
	 */
	app: App;
	/**
	 * The formatted metadata of a single note.
	 */
	cachedMetadata: CachedMetadata;
	/**
	 * The file data of a single note.
	 */
	file: TFile;
	/**
	 * The filepath of a single timeline.
	 */
	timelineFile: string;
	/**
	 * Shorthand access to HTMLElements for the range timelines and the card list.
	 */
	elements: {
		timelineRootElement: HTMLElement;
		cardListRootElement: HTMLElement;
	};
}

/**
 * The context extracted from a single note to create a single card in the timeline combined with the more general purpise timeline context.
 */
export type CompleteCardContext = Exclude<
	Awaited<ReturnType<typeof getDataFromNote>>,
	undefined
>;
/**
 * The context extracted from a single note to create a single card in the timeline.
 */
export type CardContent = Awaited<ReturnType<FnExtractCardData>>;
/**
 * The needed data to compute a range in a single timeline.
 */
export type Range = ReturnType<FnGetRangeData>[number];
