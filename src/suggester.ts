import { EditorSuggest } from "obsidian";

import { verticalTimelineToken } from "~/settings";
import { generateNumberArray, isDefinedAsNonNaNNumber } from "~/utils";
import {
	parseMarkdownBlockSource,
	acceptedSettingsOverride,
	isOverridableSettingsKey,
} from "~/markdownBlockData";
import { getTagsFromMetadataOrTagObject } from "~/cardDataExtraction";

import type AprilsAutomaticTimelinesPlugin from "~/main";
import type { AutoTimelineSettings } from "~/types";
import type {
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	EditorPosition,
	Editor,
	TFile,
	App,
} from "obsidian";

export enum SuggestionType {
	TagToFind,
	AnyOption,
	DateFormatOption,
	FontSizeTitleOption,
	FontSizeBodyOption,
	FontSizeDateOption,
	ApplyConditionalFormatingOption,
}
type OnTriggerContext = {
	block: ReturnType<typeof parseMarkdownBlockSource>;
	type: SuggestionType;
};

export class TimelineMarkdownSuggester extends EditorSuggest<string> {
	private app: App;
	private pluginSettings: AutoTimelineSettings;
	onTriggerParsedContent: null | OnTriggerContext;

	constructor(plugin: AprilsAutomaticTimelinesPlugin) {
		super(plugin.app);
		this.pluginSettings = plugin.settings;
		this.app = plugin.app;
		this.onTriggerParsedContent = null;
		this.limit = 10;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_: TFile
	): EditorSuggestTriggerInfo | null {
		this.onTriggerParsedContent = null;
		const textBeforeCurrentCursorPosition = editor.getRange(
			{ line: 0, ch: 0 },
			cursor
		);
		const startOfMarkdownBlock = getMarkdownblockStartPosition(
			textBeforeCurrentCursorPosition
		);

		if (!isDefinedAsNonNaNNumber(startOfMarkdownBlock)) return null;
		const allTheDocumentLines = editor.getValue().split("\n");
		const endOfMarkdownBlock = allTheDocumentLines.findIndex(
			checkIfLineIsClosingMarkdownBlock
		);
		const timelineMarkdownCodeBlock = allTheDocumentLines.slice(
			startOfMarkdownBlock + 1,
			endOfMarkdownBlock < 0
				? allTheDocumentLines.length
				: endOfMarkdownBlock
		);
		const line = editor.getLine(cursor.line);
		this.onTriggerParsedContent = {
			block: parseMarkdownBlockSource(timelineMarkdownCodeBlock),
			type: getSuggestionType(cursor, startOfMarkdownBlock, line),
		};
		const startCharacter = suggestionTypeIsOptionValue(
			this.onTriggerParsedContent.type
		)
			? line.indexOf(":") + 1
			: 0;

		return {
			end: cursor,
			start: {
				ch: startCharacter,
				line: cursor.line,
			},
			query: line.slice(startCharacter),
		};
	}

	getSuggestions(context: EditorSuggestContext): string[] {
		if (!this.onTriggerParsedContent) return [];
		switch (this.onTriggerParsedContent.type) {
			case SuggestionType.TagToFind: {
				return getTagToFindSuggestion(
					this.app,
					this.pluginSettings,
					context.query
				);
			}
			case SuggestionType.AnyOption: {
				return filterAndSortSuggestionResults(
					[...acceptedSettingsOverride],
					context.query,
					Object.keys(
						this.onTriggerParsedContent.block.settingsOverride
					)
				);
			}
			case SuggestionType.ApplyConditionalFormatingOption: {
				return filterAndSortSuggestionResults(
					["true", "false"],
					context.query
				);
			}
			case SuggestionType.FontSizeDateOption:
			case SuggestionType.FontSizeBodyOption:
			case SuggestionType.FontSizeTitleOption: {
				const defaultSet = generateNumberArray(10, 10).map((e) =>
					e.toString()
				);

				if (!context.query.trim().length) return defaultSet;
				const currentPotentialValidNumber = Number(
					context.query.trim()
				);

				if (!isDefinedAsNonNaNNumber(currentPotentialValidNumber))
					return defaultSet;

				return generateNumberArray(currentPotentialValidNumber).map(
					(e) => e.toString()
				);
			}
			case SuggestionType.DateFormatOption: {
				const tokens = this.pluginSettings.dateTokenConfiguration.map(
					(e) => e.name
				);
				const allreadyUsedQueries = (
					context.query.trim().match(/{[a-z0-9\s]*}/gi) || []
				).map((str) => str.slice(1, -1));

				return filterAndSortSuggestionResults(
					tokens,
					"",
					allreadyUsedQueries
				);
			}
		}
	}

	renderSuggestion(text: string, el: HTMLElement): void {
		if (!this.onTriggerParsedContent) return;
		el.createSpan({ text });
	}

	selectSuggestion(value: string, _: MouseEvent | KeyboardEvent): void {
		if (!this.onTriggerParsedContent || !this.context) return;
		let { query } = this.context;

		switch (this.onTriggerParsedContent.type) {
			case SuggestionType.TagToFind: {
				const splitToken =
					this.pluginSettings.markdownBlockTagsToFindSeparator;
				const hasEndToken = this.context.query
					.trim()
					.endsWith(splitToken);

				const list = query
					.split(splitToken)
					.map((e) => e.trim())
					.filter((e) => e !== "");

				if (!hasEndToken) list.pop();
				query = `${[...list, value].join(
					`${splitToken} `
				)}${splitToken} `.trimStart();
				break;
			}
			case SuggestionType.AnyOption: {
				query = `${value}: `;
				break;
			}
			case SuggestionType.ApplyConditionalFormatingOption:
			case SuggestionType.FontSizeBodyOption:
			case SuggestionType.FontSizeDateOption:
			case SuggestionType.FontSizeTitleOption: {
				query = ` ${value}\n`;
				break;
			}
			case SuggestionType.DateFormatOption: {
				query += `{${value}}`;
				break;
			}
		}

		this.context.editor.replaceRange(
			query,
			this.context.start,
			{
				...this.context.end,
				ch: this.context.start.ch + this.context.query.length,
			},
			"aprils-automatic-timeline"
		);
		if (
			suggestionTypeIsOptionValue(this.onTriggerParsedContent.type) &&
			this.onTriggerParsedContent.type !== SuggestionType.DateFormatOption
		)
			this.context.editor.setCursor(this.context.start.line + 1, 0);
		else
			this.context.editor.setCursor(
				this.context.start.line,
				this.context.editor.getLine(this.context.start.line).length
			);
		this.close();
	}
}

/**
 * Get the type of suggestion to make to the user based on it's previously typed query.
 *
 * @param cursor the current cursor position data.
 * @param startOfMarkdownBlock the line number where the markdown code block starts.
 * @param line the user typed line of text.
 * @returns the sought after suggestion type.
 */
function getSuggestionType(
	cursor: EditorPosition,
	startOfMarkdownBlock: number,
	line: string
): SuggestionType {
	if (cursor.line === startOfMarkdownBlock + 1)
		return SuggestionType.TagToFind;
	const reg = /((?<key>(\s|\d|[a-z])*):.*)/i;
	const key = line.match(reg)?.groups?.key;

	if (!key || !isOverridableSettingsKey(key)) return SuggestionType.AnyOption;
	switch (key) {
		case "applyAdditonalConditionFormatting":
			return SuggestionType.ApplyConditionalFormatingOption;
		case "bodyFontSize":
			return SuggestionType.FontSizeBodyOption;
		case "dateDisplayFormat":
			return SuggestionType.DateFormatOption;
		case "dateFontSize":
			return SuggestionType.FontSizeDateOption;
		case "titleFontSize":
			return SuggestionType.FontSizeTitleOption;
	}
}

/**
 * Given a query get all the `TagToFind` typed suggestions.
 * This will go trough every cached file and retrieve all timeline metadata + tags.
 *
 * @param app - The obsidian app object.
 * @param settings - The plugin settings.
 * @param query - The query that the user just typed.
 * @returns the suggestions set.
 */
function getTagToFindSuggestion(
	app: App,
	settings: AutoTimelineSettings,
	query: string
): string[] {
	const unfilteredRestults = app.vault
		.getMarkdownFiles()
		.reduce<string[]>((accumulator, file) => {
			const cachedMetadata = app.metadataCache.getFileCache(file);

			if (!cachedMetadata || !cachedMetadata.frontmatter)
				return accumulator;
			accumulator.push(
				...getTagsFromMetadataOrTagObject(
					settings,
					cachedMetadata.frontmatter,
					cachedMetadata.tags
				)
			);
			return accumulator;
		}, []);

	const allQueries = query.split(settings.markdownBlockTagsToFindSeparator);
	const currentQuery = allQueries[allQueries.length - 1];
	const allreadyUsedQueries = allQueries.slice(0, -1);

	return filterAndSortSuggestionResults(
		unfilteredRestults,
		currentQuery,
		allreadyUsedQueries
	);
}

/**
 * Given an array of string weed out any duplicates from the unfiltered set and the allreadyUsedQueries set.
 * Make sure that the current query typed in by the user is included in the listed terms.
 * And that the filtered member doesn't stricly equals the user query.
 *
 * @param unfilteredRestults - A set of string to be filtered.
 * @param currentQuery - The current string typed in by the end user.
 * @param allreadyUsedQueries - The collection of previously typed queries that should not be returned.
 * @returns A filtered and alphabeticaly sorted array.
 */
function filterAndSortSuggestionResults(
	unfilteredRestults: string[],
	currentQuery: string,
	allreadyUsedQueries: string[] = []
) {
	currentQuery = currentQuery.trim().toLowerCase();
	allreadyUsedQueries = allreadyUsedQueries.map((e) =>
		e.trim().toLowerCase()
	);

	return unfilteredRestults
		.filter((suggestionText, index) => {
			const cleanedSuggestion = suggestionText.toLowerCase().trim();
			return (
				unfilteredRestults.indexOf(suggestionText) === index &&
				!allreadyUsedQueries.includes(cleanedSuggestion) &&
				cleanedSuggestion.includes(currentQuery) &&
				cleanedSuggestion !== currentQuery
			);
		})
		.sort((a, b) => a.localeCompare(b));
}

/**
 * Given all the text before the users curosor try to determine the start of the current marakdown code block and if the cursor is in it.
 *
 * @param textBeforeCurrentCursorPosition - The text before the users curosor.
 * @returns If the cursor is in a markdown code block the function will return it's line position. Else it'll return null.
 */
function getMarkdownblockStartPosition(
	textBeforeCurrentCursorPosition: string
): number | null {
	const linesBeforeCurrentCursorPosition =
		textBeforeCurrentCursorPosition.split("\n");

	for (
		let index = linesBeforeCurrentCursorPosition.length - 1;
		index >= 0;
		index--
	) {
		const line = linesBeforeCurrentCursorPosition[index];
		if (checkIfLineIsClosingMarkdownBlock(line)) return null;
		if (checkIfLineIsOpeningMarkdownBlock(line)) return index;
	}
	return null;
}

/**
 * Check if a text line from a markdown file is the closing part of a markdown block.
 *
 * @param line - The line of text to check.
 * @returns true if it is and false if it ain't.
 */
function checkIfLineIsClosingMarkdownBlock(line: string): boolean {
	return line.trim() === "```";
}

/**
 * Check if a text line from a markdown file is the opening of a markdown block.
 *
 * @param line - The line of text to check.
 * @returns true if it is and false if it ain't.
 */
function checkIfLineIsOpeningMarkdownBlock(line: string): boolean {
	return [verticalTimelineToken].some(
		(token) => line.trim() === `\`\`\`${token}`
	);
}

/**
 *
 */
const optionValueSuggestionSet = [
	SuggestionType.ApplyConditionalFormatingOption,
	SuggestionType.DateFormatOption,
	SuggestionType.FontSizeBodyOption,
	SuggestionType.FontSizeDateOption,
	SuggestionType.FontSizeTitleOption,
] as const;

/**
 * Quick check to determine if a SuggestionType is a option value or not.
 *
 * @param suggestion - the type to check.
 * @returns true if it an option value.
 */
function suggestionTypeIsOptionValue(
	suggestion: SuggestionType
): suggestion is (typeof optionValueSuggestionSet)[number] {
	// @ts-expect-error
	return optionValueSuggestionSet.includes(suggestion);
}
