import { getMetadataKey, isDefined, isDefinedAsObject } from "~/utils";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CompleteCardContext,
} from "~/types";
import { parse } from "yaml";
import {
	getAbstractDateFromMetadata,
	getBodyFromContextOrDocument,
	getImageUrlFromContextOrDocument,
	getTagsFromMetadataOrTagObject,
} from "./cardDataExtraction";

/**
 * A un-changeable key used to check if a note is eligeable for render.
 */
const RENDER_GREENLIGHT_METADATA_KEY = ["aat-render-enabled"];

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
	if (!RENDER_GREENLIGHT_METADATA_KEY.some((key) => metaData[key] === true))
		return undefined;

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
 * Provides additional context for the creation cards in the DOM but reads it from the body
 *
 * @param body - The extracted body for a single event card.
 * @param context - Timeline generic context.
 * @param tagsToFind - The tags to find in a note to match the current timeline.
 * @returns the context or underfined if it could not build it.
 */
export async function getDataFromNoteBody(
	body: string | undefined | null,
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
): Promise<CompleteCardContext[]> {
	const { settings } = context;
	if (!body) return [];
	const inlineEventBlockRegExp = new RegExp(
		`%%${settings.noteInlineEventKey}\n(((\\s|\\d|[a-z]|-)*):(.*)\n)*%%`,
		"gi"
	);
	const originalFrontmatter = context.cachedMetadata.frontmatter;
	const matches = body.match(inlineEventBlockRegExp);

	if (!matches) return [];

	matches.unshift();
	const output: CompleteCardContext[] = [];

	for (const block of matches) {
		const sanitizedBlock = block.split("\n");

		sanitizedBlock.shift();
		sanitizedBlock.pop();

		const fakeFrontmatter = parse(sanitizedBlock.join("\n")); // this actually works lmao
		// Replace frontmatter with newly built fake one. Just to re-use all the existing code.
		context.cachedMetadata.frontmatter = fakeFrontmatter;
		if (!isDefinedAsObject(fakeFrontmatter)) continue;

		const timelineTags = getTagsFromMetadataOrTagObject(
			settings,
			fakeFrontmatter,
			context.cachedMetadata.tags
		);

		if (!extractedTagsAreValid(timelineTags, tagsToFind)) continue;

		const matchPositionInBody = body.indexOf(block);
		output.push({
			cardData: await extractCardData(
				context,
				matchPositionInBody !== -1
					? body.slice(matchPositionInBody + block.length)
					: undefined
			),
			context,
		});
	}
	context.cachedMetadata.frontmatter = originalFrontmatter;
	return output;
}

/**
 * Checks if the extracted tags match at least one of the tags to find.
 *
 * @param timelineTags - The extracted tags from the note.
 * @param tagsToFind - The tags to find.
 * @returns `true` if valid.
 */
function extractedTagsAreValid(
	timelineTags: string[],
	tagsToFind: string[]
): boolean {
	return timelineTags.some((tag) => tagsToFind.includes(tag));
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
