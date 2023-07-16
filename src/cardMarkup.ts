import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import {
	isDefined,
	createElementShort,
	dateTokenConfigurationIsTypeNumber,
	dateTokenConfigurationIsTypeString,
} from "~/utils";

import type {
	MarkdownCodeBlockTimelineProcessingContext,
	CardContent,
	AutoTimelineSettings,
	AbstractDate,
	DateTokenConfiguration,
	DateTokenType,
} from "~/types";

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
		formatBodyForCard(body),
		markdownTextWrapper,
		file.path,
		rendered
	);
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
			.replace(/```aat-vertical\n.*\n```/gi, "")
			// Trim the text
			.trim()
	);
}

/**
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

/**
 *
 * @param date - Target date to format.
 * @param param1 - The settings of the plugin.
 * @param param1.dateDisplayFormat - The target format to displat the date in.
 * @param param1.dateParserGroupPriority - The token priority list for the date format.
 * @param param1.dateTokenConfiguration - The configuration for the given date format.
 * @returns the formated representation of a given date based off the plugins settings.
 */
export function formatAbstractDate(
	date: AbstractDate | boolean,
	{
		dateDisplayFormat,
		dateParserGroupPriority,
		dateTokenConfiguration,
	}: Pick<
		AutoTimelineSettings,
		| "dateDisplayFormat"
		| "dateParserGroupPriority"
		| "dateTokenConfiguration"
	>
): string {
	if (typeof date === "boolean") return "now";
	const prioArray = dateParserGroupPriority.split(",");
	let output = dateDisplayFormat.toString();

	prioArray.forEach((token, index) => {
		const configuration = dateTokenConfiguration.find(
			({ name }) => name === token
		);

		if (!configuration)
			throw new Error(
				`[April's not so automatic timelines] - No date token configuration found for ${token}, please setup your date tokens correctly`
			);

		output = output.replace(
			`{${token}}`,
			formatDateToken(date[index], configuration)
		);
	});

	return output;
}

/**
 * Shorthand to format a part of an abstract date.
 *
 * @param datePart - fragment of an abstract date.
 * @param configuration - the configuration bound to that date token.
 * @returns the formated token.
 */
export function formatDateToken(
	datePart: number,
	configuration: DateTokenConfiguration
): string {
	if (dateTokenConfigurationIsTypeNumber(configuration))
		return formatNumberDateToken(datePart, configuration);
	if (dateTokenConfigurationIsTypeString(configuration))
		return formatStringDateToken(datePart, configuration);
	throw new Error(
		`[April's not so automatic timelines] - Corrupted date token configuration, please reset settings`
	);
}

/**
 * Used to quickly format a fragment of an abstract date based off a number typed date token configuration.
 *
 * @param datePart - fragment of an abstract date.
 * @param param1 - A numerical date token configuration to apply.
 * @param param1.minLeght - the minimal length of a numerical date input.
 * @returns the formated token.
 */
function formatNumberDateToken(
	datePart: number,
	{ minLeght }: DateTokenConfiguration<DateTokenType.number>
): string {
	let stringifiedToken = datePart.toString();

	if (minLeght < 0) return stringifiedToken;
	while (stringifiedToken.length < minLeght)
		stringifiedToken = "0" + stringifiedToken;
	return stringifiedToken;
}

/**
 * Used to quickly format a fragment of an abstract date based off a string typed date token configuration.
 *
 * @param datePart - fragment of an abstract date.
 * @param param1 - A string typed date token configuration to apply.
 * @param param1.dictionary - the relation dictionary for a date string typed token.
 * @returns the formated token.
 */
function formatStringDateToken(
	datePart: number,
	{ dictionary }: DateTokenConfiguration<DateTokenType.string>
): string {
	return dictionary[datePart];
}
