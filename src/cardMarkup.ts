import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CardContent,
	AutoTimelineSettings,
	AbstractDate,
} from "~/types";

import { isDefined, createElementShort } from "~/utils";

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
	{ body, title, imageURL, startDate, endDate }: CardContent
): void {
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
		getDateText({ startDate, endDate }, settings).trim()
	);

	createElementShort(
		cardTextWraper,
		"p",
		"aat-card-body",
		body ? body : "No body for this note :("
	);
}

function getDateText(
	{ startDate, endDate }: Pick<CardContent, "startDate" | "endDate">,
	settings: AutoTimelineSettings
): string {
	if (!isDefined(startDate)) return "Start date missing";
	const formatedStart = formatAbstractDate(startDate, settings);
	if (!isDefined(endDate)) return formatedStart;

	return `From ${formatedStart} to ${formatAbstractDate(endDate, settings)}`;
}

function formatAbstractDate(
	date: AbstractDate | boolean,
	{ dateDisplayFormat, dateParserGroupPriority }: AutoTimelineSettings
): string {
	if (typeof date === "boolean") return "now";
	const prioArray = dateParserGroupPriority.split(",");
	let output = dateDisplayFormat.toString();

	prioArray.forEach((token, index) => {
		output = output.replace(`{${token}}`, date[index].toString());
	});

	return output;
}
