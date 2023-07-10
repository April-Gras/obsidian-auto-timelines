import {
	getMetadataKey,
	isDefinedAsString,
	isDefined,
	isDefinedAsArray,
} from "~/utils";
import { FrontMatterCache, TagCache, TFile } from "obsidian";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	AbstractDate,
	AutoTimelineSettings,
	CompleteCardContext,
} from "~/types";
import { parse } from "yaml";

/**
 * A un-changeable key used to check if a note is eligeable for render.
 */
const RENDER_GREENLIGHT_METADATA_KEY = ["aat-render-enabled"];

/**
 * Provides additional context for the creation cards in the DOM.
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext } context - Timeline generic context.
 * @param { string[] } tagsToFind - The tags to find in a note to match the current timeline.
 * @returns { CompleteCardContext | undefined } the context or underfined if it could not build it.
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

	const timelineTags = getNoteTags(settings, metaData, tags);

	// TimelineTags is not defined as an array :<
	// OR Sought after tags where not found
	if (
		!timelineTags.length ||
		!timelineTags.some((tag) => tagsToFind.includes(tag))
	)
		return undefined;

	return {
		cardData: await extractCardData(context),
		context,
	} as const;
}

/**
 * Provides additional context for the creation cards in the DOM but reads it from the body
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext } context - Timeline generic context.
 * @param { string[] } tagsToFind - The tags to find in a note to match the current timeline.
 * @returns { CompleteCardContext | undefined } the context or underfined if it could not build it.
 */
export async function getDataFromNoteBody(
	{ cardData: { body }, context }: CompleteCardContext,
	tagsToFind: string[]
): Promise<CompleteCardContext[]> {
	const { settings } = context;
	if (!body) return [];
	const inlineEventBlockRegExp = new RegExp(
		`%%${settings.noteInlineNoteKey}\n(((\\s|\\d|[a-z]|-)*):(.*)\n)*%%`,
		"gi"
	);
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

		output.push({
			context,
			cardData: await extractCardData(context),
		});
	}

	return output;
}

/**
 * Get the content of a card from a note. This function will parse the raw text content of a note and format it.
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext } context - Timeline generic context.
 * @returns { CardContent } The extracted data to create a card from a note.
 */
export async function extractCardData(
	context: MarkdownCodeBlockTimelineProcessingContext
) {
	const { file, cachedMetadata: c, settings } = context;
	const rawFileContent = await file.vault.cachedRead(file);
	const fileTitle =
		c.frontmatter?.[settings.metadataKeyEventTitleOverride] ||
		file.basename;

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

/**
 * Extract the body from the raw text of a note.
 * @decsription After extraction most markdown tokens will be removed and links will be sanitized aswell and wrapped into bold tags for clearner display.
 *
 * @param { string } rawFileText - The text content of a obsidian note.
 * @param { MarkdownCodeBlockTimelineProcessingContext } context - Timeline generic context.
 * @returns { string | null } the body of a given card or null if none was found.
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

	const out = finalString
		// Remove external image links
		.replace(/!\[.*\]\(.*\)/gi, "")
		// Remove tags
		.replace(/#[a-zA-Z\d-_]*/gi, "")
		// Remove internal images ![[Pasted image 20230418232101.png]]
		.replace(/!\[\[.*\]\]/gi, "")
		// Remove other timelines to avoid circular dependencies!
		.replace(/```aat-vertical\n.*\n```/gi, "")
		// Trim the text
		.trim();
	return out;
}

/**
 * Extract the first image from the raw markdown in a note.
 *
 * @param { string } rawFileText - The text content of a obsidian note.
 * @param { MarkdownCodeBlockTimelineProcessingContext } context - Timeline generic context.
 * @returns { string | null } the URL of the image to be displayed in a card or null if none where found.
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
 * @param { MarkdownCodeBlockTimelineProcessingContext } param0 - Timeline generic context.
 * @param { string } key - The target lookup key in the notes metadata object.
 * @returns { AbstractDate | undefined } the abstract date representation or undefined.
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
	return getAbstractDateFromData(
		groupsToCheck,
		stringValue,
		settings.dateParserRegex
	);
}

export function getAbstractDateFromData(
	groupsToCheck: string[],
	metadataString: string,
	reg: RegExp | string
): AbstractDate | undefined {
	const matches = metadataString.match(reg);

	if (!matches || !matches.groups) return undefined;

	const { groups } = matches;

	const output = groupsToCheck.reduce((accumulator, groupName) => {
		const value = Number(groups[groupName]);

		// In the case of a faulty regex given by the user in the settings
		if (!isNaN(value)) accumulator.push(value);
		return accumulator;
	}, [] as AbstractDate);

	// Malformed payload bail out
	if (output.length !== groupsToCheck.length) return undefined;

	return output;
}

/**
 * Returns a list of tags to for in a note based of plugin settings, note frontmatter and note tags.
 *
 * @param { AutoTimelineSettings } settings - The plugins settings.
 * @param { FrontMatterCache } metaData - The frontematter cache.
 * @param { TagCache[] | undefined } tags - Potencial tags.
 * @returns A list of tags to look for in a note.
 */
export function getNoteTags(
	settings: AutoTimelineSettings,
	metaData: FrontMatterCache,
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
