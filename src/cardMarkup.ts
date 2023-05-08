import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CardContent,
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

	if (isDefined(startDate) || isDefined(endDate)) {
		const hasStart = isDefined(startDate);
		const hasEnd = isDefined(endDate);
		const both = hasStart && hasEnd;

		// TODO handle clearer display
		createElementShort(
			titleWrap,
			"h4",
			"aat-card-start-date",
			`${both ? "From" : ""} ${startDate?.join("/")} ${
				hasEnd
					? `to ${
							typeof endDate === "boolean"
								? "now"
								: endDate.join("/")
					  }`
					: ""
			}`.trim()
		);
	}

	createElementShort(
		cardTextWraper,
		"p",
		"aat-card-body",
		body ? body : "No body for this note :("
	);
}
