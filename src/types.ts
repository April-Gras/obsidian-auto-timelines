import type { CachedMetadata, TFile } from "obsidian";

import {} from "";
import { FnExtractCardData, getDataFromNote } from "~/cardData";

export interface AutoTimelineSettings {}
export interface MarkdownCodeBlockTimelineProcessingContext {
	cachedMetadata: CachedMetadata;
	file: TFile;
	elements: {
		timelineRootElement: HTMLElement;
		cardListRootElement: HTMLElement;
	};
}

export type CompleteCardContext = Exclude<
	Awaited<ReturnType<typeof getDataFromNote>>,
	undefined
>;
export type CardContent = Awaited<ReturnType<FnExtractCardData>>;
