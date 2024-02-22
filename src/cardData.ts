import { getMetadataKey, isDefined, isOrderedSubArray } from "~/utils";

import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";
import {
	getAbstractDateFromMetadata,
	getBodyFromContextOrDocument,
	getImageUrlFromContextOrDocument,
	getTagsFromMetadataOrTagObject,
} from "./cardDataExtraction";

/**
 * Provides additional context for the creation cards in the DOM.
 *
 * @param context - Timeline generic context.
 * @param tagsToFind - The tags to find in a note to match the current timeline.
 * @returns the context or underfined if it could not build it.
 */
export async function getDataFromNoteMetadata(
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
) {
	const { cachedMetadata, settings } = context;
	const { frontmatter: metaData, tags } = cachedMetadata;

	if (!metaData) return undefined;
	if (metaData[settings.eventRenderToggleKey] !== true) return undefined;

	const timelineTags = getTagsFromMetadataOrTagObject(
		settings,
		metaData,
		tags
	);

	if (!extractedTagsAreValid(timelineTags, tagsToFind)) return undefined;

	return {
		cardData: await extractCardData(context),
		context,
	} as const;
}

/**
 * Checks if the extracted tags match at least one of the tags to find.
 *
 * @param noteTags - The extracted tags from the note.
 * @param tagsToFind - The tags to find for this timeline.
 * @returns `true` if valid.
 */
export function extractedTagsAreValid(
	noteTags: string[],
	tagsToFind: string[]
): boolean {
	// Split to accoun for obsidian nested tags
	// https://help.obsidian.md/Editing+and+formatting/Tags#Nested+tags
	const noteTagCollection = noteTags.map((e) => e.split("/"));

	return tagsToFind.some((tag) => {
		const timelineTag = tag.split("/");

		return noteTagCollection.some((fileTag) =>
			isOrderedSubArray(fileTag, timelineTag)
		);
	});
}

/**
 * Get the content of a card from a note. This function will parse the raw text content of a note and format it.
 *
 * @param context - Timeline generic context.
 * @param rawFileContent - If you already have it, will avoid reading the file again.
 * @returns The extracted data to create a card from a note.
 */
export async function extractCardData(
	context: MarkdownCodeBlockTimelineProcessingContext,
	rawFileContent?: string
) {
	const { file, cachedMetadata: c, settings } = context;
	const fileTitle =
		c.frontmatter?.[settings.metadataKeyEventTitleOverride] ||
		file.basename;

	rawFileContent = rawFileContent || (await file.vault.cachedRead(file));
	return {
		title: fileTitle as string,
		body: getBodyFromContextOrDocument(rawFileContent, context),
		imageURL: getImageUrlFromContextOrDocument(rawFileContent, context),
		startDate: getAbstractDateFromMetadata(
			context,
			settings.metadataKeyEventStartDate
		),
		endDate:
			getAbstractDateFromMetadata(
				context,
				settings.metadataKeyEventEndDate
			) ??
			(isDefined(
				getMetadataKey(c, settings.metadataKeyEventEndDate, "boolean")
			)
				? true
				: undefined),
	} as const;
}
export type FnExtractCardData = typeof extractCardData;
