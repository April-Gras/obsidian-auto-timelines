import type { CachedMetadata, TFile } from "obsidian";

import { FnExtractCardData } from "~/cardData";

export interface AutoTimelineSettings {}
export interface MarkdownCodeBlockTimelineProcessingContext {
	cachedMetadata: CachedMetadata;
	file: TFile;
	elements: {
		timelineRootElement: HTMLElement;
		cardListRootElement: HTMLElement;
	};
}

export type CardContent = Awaited<ReturnType<FnExtractCardData>>;
