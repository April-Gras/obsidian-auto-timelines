import { getMetadataKey, isDefinedAsString } from "~/utils";
import { DEFAULT_METADATA_KEYS } from "~/settings";

import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

const RENDER_GREENLIGHT_METADATA_KEY = ["aat-render-enabled"];
export async function getDataFromNote(
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
) {
	const { cachedMetadata } = context;
	const { frontmatter: metaData } = cachedMetadata;

	if (!metaData) return undefined;
	if (!RENDER_GREENLIGHT_METADATA_KEY.some((key) => metaData[key] === true))
		return undefined;
	if (
		!metaData.timelines ||
		!(metaData.timelines instanceof Array) ||
		!metaData.timelines.length
	)
		return undefined;
	const timelineTags = metaData.timelines.filter(isDefinedAsString);

	// TimelineTags is not defined as an array :<
	if (!timelineTags.length || !timelineTags.some(() => tagsToFind.includes))
		return undefined;

	return {
		cardData: await extractCardData(context),
		context,
	} as const;
}

async function extractCardData(
	context: MarkdownCodeBlockTimelineProcessingContext
) {
	const { file, cachedMetadata: c } = context;
	const rawFileContent = await file.vault.cachedRead(file);
	const fileTitle = file.basename;

	return {
		title: fileTitle,
		body: getBodyFromContextOrDocument(rawFileContent, context),
		imageURL: getImageUrlFromContextOrDocument(rawFileContent, context),
		startDate: getMetadataKey(
			c,
			DEFAULT_METADATA_KEYS.eventStartDate,
			"number"
		),
		endDate:
			getMetadataKey(c, DEFAULT_METADATA_KEYS.eventEndDate, "number") ??
			getMetadataKey(c, DEFAULT_METADATA_KEYS.eventEndDate, "boolean"),
	} as const;
}
export type FnExtractCardData = typeof extractCardData;

function getBodyFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
	} = context;
	const overrideBody = metadata?.["aat-body"] ?? null;

	if (!rawFileText) return overrideBody;

	const rawTextArray = rawFileText.split("\n");
	rawTextArray.shift();
	const processedArray = rawTextArray.slice(rawTextArray.indexOf("---") + 1);
	const finalString = processedArray.join("\n").trim();

	return (
		finalString
			// Remove vanilla links
			.replace(/\[\[([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
			// Remove named links
			.replace(/\[\[[a-z0-9 ]*\|([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
			// Remove clutter
			.replace(/#|!\[\[.*\]\]/gi, "")
			.trim()
	);
}

function getImageUrlFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
	} = context;
	const matchs = rawFileText.match(/!\[\[(?<src>.*)\]\]/);

	if (!matchs || !matchs.groups || !matchs.groups.src)
		return metadata?.["aat-image-url"] || null;

	return `app://local/home/mgras/book/Book/${encodeURI(matchs.groups.src)}`;
}
