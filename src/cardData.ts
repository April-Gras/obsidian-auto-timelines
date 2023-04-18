import { getMetadataKey, isDefinedAsString } from "~/utils";
import { DEFAULT_METADATA_KEYS } from "~/settings";
import { TFile } from "obsidian";

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
	const fileTitle =
		c?.frontmatter?.[DEFAULT_METADATA_KEYS.eventTitleOverride] ||
		file.basename;

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

	const out = finalString
		// Remove vanilla internal links
		.replace(/\[\[([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
		// Remove named internal links
		.replace(/\[\[[a-z0-9 ]*\|([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
		// Remove external image links
		.replace(/!\[.*\]\(.*\)/gi, "")
		// Remove markdown clutter
		.replace(/#|!\[\[.*\]\]/gi, "")
		// Trim the text
		.trim();
	return out;
}

function getImageUrlFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
		file: currentFile,
		app,
	} = context;
	const {
		vault,
		metadataCache: { getFirstLinkpathDest },
	} = app;
	const override = metadata?.[DEFAULT_METADATA_KEYS.eventPictureOverride];

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
		);

		if (file instanceof TFile) return vault.getResourcePath(file);
		// Thanks https://github.com/joethei
		return null;
	} else return encodeURI(matchs.groups.src);
}
