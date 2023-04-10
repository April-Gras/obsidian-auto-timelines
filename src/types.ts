import type { CachedMetadata, TFile } from "obsidian";

export interface AutoTimelineSettings {}
export interface MarkdownCodeBlockTimelineProcessingContext {
	cachedMetadata: CachedMetadata;
	file: TFile;
	elements: {
		timelineRootElement: HTMLElement;
		cardListRootElement: HTMLElement;
	};
}
