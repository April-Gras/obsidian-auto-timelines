import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { isDefined, createElementShort } from "~/utils";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CardContent,
	AutoTimelineSettings,
} from "~/types";
import { formatAbstractDate } from "./abstractDateFormatting";

/**
 * Generates a card in the DOM based on given ccontext.
 *
 * @param param0 - The context built for this timeline.
 * @param param0.elements - The HTMLElements exposed for this context.
 * @param param0.elements.cardListRootElement - The right side of the timeline, this is where the carads are spawned.
 * @param param0.file - The target note file.
 * @param param0.settings - The plugin's settings.
 * @param cardContent - The content of a single timeline card.
 */
export function createCardFromBuiltContext(
	{
		elements: { cardListRootElement },
		file,
		settings,
	}: MarkdownCodeBlockTimelineProcessingContext,
	cardContent: CardContent
): void {
	const { body, title, imageURL } = cardContent;
	const cardBaseDiv = createElementShort(cardListRootElement, "a", [
		"internal-link",
		"aat-card",
	]);
	cardBaseDiv.setAttribute("href", file.path);

	if (imageURL) {
		createElementShort(cardBaseDiv, "img", "aat-card-image").setAttribute(
			"src",
			imageURL
		);
		cardBaseDiv.addClass("aat-card-has-image");
	}

	const cardTextWraper = createElementShort(
		cardBaseDiv,
		"div",
		"aat-card-text-wraper"
	);

	const titleWrap = createElementShort(
		cardTextWraper,
		"header",
		"aat-card-head-wrap"
	);

	const titleElement = createElementShort(
		titleWrap,
		"h2",
		"aat-card-title",
		title
	);
	if (settings.titleFontSize >= 0)
		titleElement.style.fontSize = `${settings.titleFontSize}px`;

	const dateElement = createElementShort(
		titleWrap,
		"h4",
		"aat-card-start-date",
		getDateText(cardContent, settings).trim()
	);

	if (settings.dateFontSize >= 0)
		dateElement.style.fontSize = `${settings.dateFontSize}px`;

	const markdownTextWrapper = createElementShort(
		cardTextWraper,
		"div",
		"aat-card-body"
	);
	const rendered = new MarkdownRenderChild(markdownTextWrapper);

	rendered.containerEl = markdownTextWrapper;
	MarkdownRenderer.renderMarkdown(
		formatBodyForCard(body),
		markdownTextWrapper,
		file.path,
		rendered
	);
	if (settings.bodyFontSize > 0)
		markdownTextWrapper.style.fontSize = `${settings.bodyFontSize}px`;
}

/**
 * Format the body string of the note data for a single card.
 *
 * @param body - The body string parsed earlier.
 * @returns The formated string ready to be displayed.
 */
export function formatBodyForCard(body?: string | null): string {
	if (!body) return "No body for this note :(";

	// Remove external image links
	return (
		body
			.replace(/!\[.*\]\(.*\)/gi, "")
			// Remove tags
			.replace(/#[a-zA-Z\d-_]*/gi, "")
			// Remove internal images ![[Pasted image 20230418232101.png]]
			.replace(/!\[\[.*\]\]/gi, "")
			// Remove other timelines to avoid circular dependencies!
			.replace(/```aat-vertical\n(.|\n)*\n```/gi, "")
			// Trim the text
			.trim()
	);
}

/**
 * Get the text displayed in the card where the date should be.
 *
 * @param param0 - The context for a single card.
 * @param param0.startDate - the start date of an event.
 * @param param0.endDate - the end date of an event.
 * @param settings - The settings of the plugin.
 * @returns a formated string representation of the dates included in the card content based off the settings.
 */
export function getDateText(
	{ startDate, endDate }: Pick<CardContent, "startDate" | "endDate">,
	settings: AutoTimelineSettings
): string {
	if (!isDefined(startDate)) return "Start date missing";
	const formatedStart = formatAbstractDate(startDate, settings);
	if (!isDefined(endDate)) return formatedStart;

	return `From ${formatedStart} to ${formatAbstractDate(endDate, settings)}`;
}
