import {
	isDefinedAsString,
	isDefined,
	isDefinedAsArray,
	getMetadataKey,
	parseAbstractDate,
} from "~/utils";

import { FrontMatterCache, TagCache, TFile } from "obsidian";
import type {
	AutoTimelineSettings,
	AbstractDate,
	MarkdownCodeBlockTimelineProcessingContext,
} from "~/types";

/**
 * Returns a list of tags based off plugin settings, note frontmatter and note tags.
 *
 * @param settings - The plugins settings.
 * @param metaData - The frontematter cache.
 * @param tags - Potencial tags.
 * @returns A list of tags to look for in a note.
 */
export function getTagsFromMetadataOrTagObject(
	settings: AutoTimelineSettings,
	metaData: Omit<FrontMatterCache, "position">,
	tags?: TagCache[]
): string[] {
	let output = [] as string[];
	const timelineArray = metaData[settings.metadataKeyEventTimelineTag];

	if (isDefinedAsArray(timelineArray))
		output = timelineArray.filter(isDefinedAsString);
	// Breakout earlier if we don't check the tags
	if (!settings.lookForTagsForTimeline) return output;
	if (isDefinedAsArray(tags))
		output = output.concat(tags.map(({ tag }) => tag.substring(1)));

	// Tags in the frontmatter
	const metadataInlineTags = metaData.tags;
	if (!isDefined(metadataInlineTags)) return output;
	if (isDefinedAsString(metadataInlineTags))
		output = output.concat(
			metadataInlineTags.split(",").map((e) => e.trim())
		);
	if (isDefinedAsArray(metadataInlineTags))
		output = output.concat(metadataInlineTags.filter(isDefinedAsString));
	// .substring called to remove the initial `#` in the notes tags
	return output;
}

/**
 * Extract the body from the raw text of a note.
 * After extraction most markdown tokens will be removed and links will be sanitized aswell and wrapped into bold tags for clearner display.
 *
 * @param rawFileText - The text content of a obsidian note.
 * @param context - Timeline generic context.
 * @returns the body of a given card or null if none was found.
 */
export function getBodyFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
		settings: { metadataKeyEventBodyOverride },
	} = context;
	const overrideBody = metadata?.[metadataKeyEventBodyOverride] ?? null;

	if (!rawFileText.length || overrideBody) return overrideBody;

	const rawTextArray = rawFileText.split("\n");
	rawTextArray.shift();
	const processedArray = rawTextArray.slice(rawTextArray.indexOf("---") + 1);
	const finalString = processedArray.join("\n").trim();

	return finalString;
}

/**
 * Extract the first image from the raw markdown in a note.
 *
 * @param rawFileText - The text content of a obsidian note.
 * @param context - Timeline generic context.
 * @returns the URL of the image to be displayed in a card or null if none where found.
 */
export function getImageUrlFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
		file: currentFile,
		app,
		settings: { metadataKeyEventPictureOverride },
	} = context;
	const {
		vault,
		metadataCache: { getFirstLinkpathDest },
	} = app;
	const override = metadata?.[metadataKeyEventPictureOverride];

	if (override) return override;
	const internalLinkMatch = rawFileText.match(/!\[\[(?<src>.*)\]\]/);
	const matchs =
		internalLinkMatch || rawFileText.match(/!\[.*\]\((?<src>.*)\)/);

	if (!matchs || !matchs.groups || !matchs.groups.src) return null;

	if (internalLinkMatch) {
		// https://github.com/obsidianmd/obsidian-releases/pull/1882#issuecomment-1512952295
		const file = getFirstLinkpathDest.bind(app.metadataCache)(
			matchs.groups.src,
			currentFile.path
		) as TFile | null;

		if (file instanceof TFile) return vault.getResourcePath(file);
		// Thanks https://github.com/joethei
		return null;
	} else return encodeURI(matchs.groups.src);
}

/**
 * Given a metadata key it'll try to parse the associated data as an `AbstractDate` and return it
 *
 * @param param0 - Timeline generic context.
 * @param param0.cachedMetadata - The cached metadata from a note.
 * @param param0.settings - the plugin's settings.
 * @param key - The target lookup key in the notes metadata object.
 * @returns the abstract date representation or undefined.
 */
export function getAbstractDateFromMetadata(
	{ cachedMetadata, settings }: MarkdownCodeBlockTimelineProcessingContext,
	key: string
): AbstractDate | undefined {
	const groupsToCheck = settings.dateParserGroupPriority.split(",");
	const numberValue = getMetadataKey(cachedMetadata, key, "number");

	if (isDefined(numberValue)) {
		const additionalContentForNumberOnlydate = [
			...Array(Math.max(0, groupsToCheck.length - 1)),
		].map(() => 0);

		return [numberValue, ...additionalContentForNumberOnlydate];
	}

	const stringValue = getMetadataKey(cachedMetadata, key, "string");

	if (!stringValue) return undefined;
	return parseAbstractDate(
		groupsToCheck,
		stringValue,
		settings.dateParserRegex
	);
}
