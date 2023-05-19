import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { isDefined, createElementShort } from "~/utils";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CardContent,
	AutoTimelineSettings,
	AbstractDate,
} from "~/types";

/**
 * Generates a card in the DOM based on given ccontext.
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext } param0 - The context built for this timeline.
 * @param { CardContent } param1 - The context for a single card.
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

	createElementShort(titleWrap, "h2", "aat-card-title", title);

	createElementShort(
		titleWrap,
		"h4",
		"aat-card-start-date",
		getDateText(cardContent, settings).trim()
	);

	const markdownTextWrapper = createElementShort(
		cardTextWraper,
		"div",
		"aat-card-body"
	);
	const rendered = new MarkdownRenderChild(markdownTextWrapper);

	rendered.containerEl = markdownTextWrapper;
	MarkdownRenderer.renderMarkdown(
		body ? body : "No body for this note :(",
		markdownTextWrapper,
		file.path,
		rendered
	);
}

/**
 *
 * @param { CardContent } param0 - The context for a single card.
 * @param { AutoTimelineSettings } settings - The settings of the plugin.
 * @returns { string } a formated string representation of the dates included in the card content based off the settings.
 */
function getDateText(
	{ startDate, endDate }: CardContent,
	settings: AutoTimelineSettings
): string {
	if (!isDefined(startDate)) return "Start date missing";
	const formatedStart = formatAbstractDate(startDate, settings);
	if (!isDefined(endDate)) return formatedStart;

	return `From ${formatedStart} to ${formatAbstractDate(endDate, settings)}`;
}

/**
 *
 * @param { AbstractDate } date - Target date to format.
 * @param { AutoTimelineSettings } param1 - The settings of the plugin.
 * @returns { string } the formated representation of a given date based off the plugins settings.
 */
export function formatAbstractDate(
	date: AbstractDate | boolean,
	{
		dateDisplayFormat,
		dateParserGroupPriority,
	}: Pick<
		AutoTimelineSettings,
		"dateDisplayFormat" | "dateParserGroupPriority"
	>
): string {
	if (typeof date === "boolean") return "now";
	const prioArray = dateParserGroupPriority.split(",");
	let output = dateDisplayFormat.toString();

	prioArray.forEach((token, index) => {
		output = output.replace(`{${token}}`, date[index].toString());
	});

	return output;
}
