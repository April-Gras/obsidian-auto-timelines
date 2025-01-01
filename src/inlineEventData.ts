import { parse } from "yaml";

import {
	cloneMarkdownCodeBlockTimelineProcessingContext,
	isDefined,
	isDefinedAsArray,
	isDefinedAsObject,
} from "~/utils";
import { extractedTagsAreValid, extractCardData } from "~/cardData";
import { getTagsFromMetadataOrTagObject } from "~/cardDataExtraction";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CompleteCardContext,
} from "~/types";

/**
 * Get the all the different inline events from a note.
 * This includes the classic comment event.
 * And the calendarium span events.
 *
 * @param body - The extracted body for a single event card.
 * @param context - Timeline generic context.
 * @param tagsToFind - The tags to find in a note to match the current timeline.
 * @returns the context additional events
 */
export async function getInlineEventData(
	body: string | undefined | null,
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
): Promise<CompleteCardContext[]> {
	const { settings } = context;
	const promiseArray: Promise<CompleteCardContext[]>[] = [];

	if (settings.lookForInlineEventsInNotes)
		promiseArray.push(getDataFromNoteBody(body, context, tagsToFind));
	if (settings.lookForCalendariumSpanEvents)
		promiseArray.push(
			getDataFromFantasyCalendarSpanEvents(body, context, tagsToFind)
		);

	return (await Promise.all(promiseArray)).flat().filter(isDefined);
}

/**
 * Provides additional context for the creation cards in the DOM but reads it from the body
 *
 * @param body - The extracted body for a single event card.
 * @param context - Timeline generic context.
 * @param tagsToFind - The tags to find in a note to match the current timeline.
 * @returns the context additional events
 */
export async function getDataFromNoteBody(
	body: string | undefined | null,
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
): Promise<CompleteCardContext[]> {
	if (!body) return [];
	const clonedContext =
		cloneMarkdownCodeBlockTimelineProcessingContext(context);
	const { settings } = clonedContext;
	const inlineEventBlockRegExp = new RegExp(
		// eslint-disable-next-line no-useless-escape
		`%%${settings.noteInlineEventKey}\n\s*(((\\s|\\d|[a-z]|-)*):(.*)\n\s*)*%%`,
		"gi"
	);
	const matches = body.match(inlineEventBlockRegExp);

	if (!matches) return [];

	const output: CompleteCardContext[] = [];

	for (const block of matches) {
		const sanitizedBlock = block.split("\n");

		sanitizedBlock.shift();
		sanitizedBlock.pop();

		const fakeFrontmatter = parse(sanitizedBlock.join("\n")); // this actually works lmao
		// Replace frontmatter with newly built fake one. Just to re-use all the existing code.
		clonedContext.cachedMetadata.frontmatter = fakeFrontmatter;
		if (!isDefinedAsObject(fakeFrontmatter)) continue;
		if (fakeFrontmatter[settings.eventRenderToggleKey] !== true) continue;

		const noteTags = getTagsFromMetadataOrTagObject(
			settings,
			fakeFrontmatter,
			clonedContext.cachedMetadata.tags
		);

		// In this special edge case we make sure the image override parsed by YAML is flatten to a Obsidian internal link
		if (
			isDefinedAsArray(
				clonedContext.cachedMetadata?.frontmatter?.[
					settings.metadataKeyEventPictureOverride
				]
			)
		)
			clonedContext.cachedMetadata.frontmatter[
				settings.metadataKeyEventPictureOverride
			] = `[[${
				clonedContext.cachedMetadata.frontmatter[
					settings.metadataKeyEventPictureOverride
				]
			}]]`;

		if (!extractedTagsAreValid(noteTags, tagsToFind)) continue;

		const matchPositionInBody = body.indexOf(block);
		output.push({
			cardData: await extractCardData(
				clonedContext,
				matchPositionInBody !== -1
					? body.slice(matchPositionInBody + block.length)
					: undefined
			),
			context: clonedContext,
		});
	}
	return output;
}

/**
 * Provides additional context for the creation cards in the DOM but reads it from the body using @javalent
 * the-calendarium's <span /> events.
 * (https://plugins.javalent.com/calendarium/events/automatic#Span+tag+event+creation)
 *
 * @param body - The extracted body for a single event card.
 * @param context - Timeline generic context.
 * @param tagsToFind - The tags to find in a note to match the current timeline.
 * @returns the context additional events
 */
export async function getDataFromFantasyCalendarSpanEvents(
	body: string | undefined | null,
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
): Promise<CompleteCardContext[]> {
	if (!body) return [];
	const parser = new DOMParser();
	const htmlDoc = parser.parseFromString(body, "text/html");
	const nodeList = Array.from(
		htmlDoc.querySelectorAll("span[data-name], div[data-name]")
	);

	if (!nodeList.length) return [];

	const clonedContext =
		cloneMarkdownCodeBlockTimelineProcessingContext(context);
	const { settings } = clonedContext;
	// Please refer to https://github.com/javalent/the-calendarium
	// And https://plugins.javalent.com/calendarium/events/automatic#Span+tag+event+creation
	// For more details one these keys
	const attributeDictionary = {
		"data-date": settings.metadataKeyEventStartDate,
		"data-end": settings.metadataKeyEventEndDate,
		"data-img": settings.metadataKeyEventPictureOverride,
		"data-name": settings.metadataKeyEventTitleOverride,
	} as const;
	const attributesToLookFor = Object.keys(
		attributeDictionary
	) as (keyof typeof attributeDictionary)[];
	const output: CompleteCardContext[] = [];

	for (const element of nodeList) {
		const fakeFrontmatter = attributesToLookFor.reduce(
			(accumulator, key) => {
				accumulator[attributeDictionary[key]] =
					element.getAttribute(key);
				return accumulator;
			},
			{} as Record<string, string | string[] | null>
		);
		fakeFrontmatter[settings.metadataKeyEventTimelineTag] =
			parseSpanEventTimelineTagArray(
				element.getAttribute(settings.metadataKeyEventTimelineTag),
				context
			) || [];

		fakeFrontmatter[settings.metadataKeyEventBodyOverride] =
			element.textContent;

		const noteTags = getTagsFromMetadataOrTagObject(
			settings,
			fakeFrontmatter,
			context.cachedMetadata.tags
		);

		if (!extractedTagsAreValid(noteTags, tagsToFind)) continue;
		const matchPositionInBody = htmlDoc.body.innerHTML.indexOf(
			element.outerHTML
		);

		clonedContext.cachedMetadata.frontmatter = fakeFrontmatter;
		output.push({
			cardData: await extractCardData(
				clonedContext,
				matchPositionInBody !== -1
					? body.slice(matchPositionInBody + element.outerHTML.length)
					: undefined
			),
			context: clonedContext,
		});
	}

	return output;
}

/**
 * Used to parse the attribute extracted from the span element into a usable list of timeline tags.
 *
 * @param input - the string contained in the DOM element argument.
 * @param root0 - App Context
 * @param root0.settings - App Settings
 * @returns if matches are found it'll return a cleaned list of the target tags or null if no matches where found.
 */
function parseSpanEventTimelineTagArray(
	input: string | null,
	{ settings }: MarkdownCodeBlockTimelineProcessingContext
): string[] | null {
	if (!input) return null;
	// Will capture the content of the array but needs to be split with
	// settings.markdownBlockTagsToFindSeparator
	const arrayParsingRegex = /\[?([^[\]]*)\]?/i;
	const arrayMatches = input.match(arrayParsingRegex);

	if (!arrayMatches) return null;
	return (arrayMatches[1] || "")
		.split(settings.markdownBlockTagsToFindSeparator)
		.map((e) => e.trim());
}
