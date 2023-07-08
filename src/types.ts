import { SETTINGS_DEFAULT } from "~/settings";
import { FnGetRangeData } from "./rangeData";
import { FnExtractCardData, getDataFromNote } from "~/cardData";

import type { App, CachedMetadata, TFile } from "obsidian";
import type { Merge } from "ts-essentials";
export type AutoTimelineSettings = typeof SETTINGS_DEFAULT;
/**
 * The main bundle of data needed to build a timeline.
 */
export interface MarkdownCodeBlockTimelineProcessingContext {
	/**
	 * Obsidian application context.
	 */
	app: App;
	/**
	 * The plugins settings
	 */
	settings: AutoTimelineSettings;
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

/**
 * An abstract representation of a fantasy date.
 * Given the fickle nature of story telling and how people will literally almost never stick to standard date formats
 * We'll organise the dates in segments, let's take for example our human callendar
 * The date will commonly be segmented in 3 parts year, month and day the abstract representation will equate to
 * `[year, month, day]`
 * Now if someone wants to make a more complex date system like `[cycle, moon, phase, day]` we can treat them the same when sorting and performing computing tasks on those dates.
 * The only major limitation to this system is that all the dates must respect the same system.
 */
export type AbstractDate = number[];

/**
 * Before formating an abstract date, the end user can configure it's output display
 * This DateToken type helps to determine what's the nature of a given token
 * E.g. should it be displayed as a number or as a string ?
 */
export enum DateTokenType {
	number = "NUMBER",
	string = "STRING",
}

export const availableDateTokenTypeArray = Object.values(DateTokenType);

/**
 * The data used to compute the output of an abstract date based on it's type
 */
type CommonValues<T extends DateTokenType> = { name: string; type: T };
export type DateTokenConfiguration<T extends DateTokenType = DateTokenType> =
	T extends DateTokenType.number
		? NumberSpecific
		: T extends DateTokenType.string
		? StringSpecific
		: StringSpecific | NumberSpecific;

/**
 * Number typed date token.
 */
type NumberSpecific = Merge<
	CommonValues<DateTokenType.number>,
	{
		/**
		 * The minimum ammount of digits when displaying the date
		 */
		minLeght: number;
		displayWhenZero: boolean;
	}
>;

/**
 * String typed date token.
 */
type StringSpecific = Merge<
	CommonValues<DateTokenType.string>,
	{
		/**
		 * The dictionary reference for the token
		 */
		dictionary: string[];
	}
>;
