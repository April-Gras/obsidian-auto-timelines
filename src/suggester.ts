import { EditorSuggest } from "obsidian";

import { verticalTimelineToken } from "~/settings";
import { isDefinedAsNonNaNNumber } from "~/utils";
import { parseMarkdownBlockSource } from "~/markdownBlockData";

import type AprilsAutomaticTimelinesPlugin from "~/main";
import type { AutoTimelineSettings } from "~/types";
import type {
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	EditorPosition,
	Editor,
	TFile,
} from "obsidian";

export class TimelineMarkdownSuggester extends EditorSuggest<string> {
	private pluginSettings: AutoTimelineSettings;
	context: EditorSuggestContext | null;

	constructor(plugin: AprilsAutomaticTimelinesPlugin) {
		super(plugin.app);
		this.pluginSettings = plugin.settings;
	}

	getSuggestions(ctx: EditorSuggestContext): string[] {
		return ["sample", "sample2"];
	}

	renderSuggestion(text: string, el: HTMLElement): void {
		el.createSpan({ text });
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile
	): EditorSuggestTriggerInfo | null {
		const textBeforeCurrentCursorPosition = editor.getRange(
			{ line: 0, ch: 0 },
			cursor
		);
		const timelineMarkdownBlockStart = getEncounterLinePosition(
			textBeforeCurrentCursorPosition
		);

		if (!isDefinedAsNonNaNNumber(timelineMarkdownBlockStart)) return null;
		const allTheDocumentLines = editor.getValue().split("\n");
		const endOfMarkdownBlock = allTheDocumentLines.findIndex(
			checkIfLineIsClosingMarkdownBlock
		);
		const timelineMarkdownCodeBlock = allTheDocumentLines.slice(
			timelineMarkdownBlockStart + 1,
			endOfMarkdownBlock < 0
				? allTheDocumentLines.length
				: endOfMarkdownBlock
		);
		const currentContent = parseMarkdownBlockSource(
			timelineMarkdownCodeBlock
		);

		console.log(currentContent);
		return null;
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		return;
	}
}

/**
 *
 * @param textBeforeCurrentCursorPosition
 */
function getEncounterLinePosition(
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
 *
 * @param line
 */
function checkIfLineIsClosingMarkdownBlock(line: string): boolean {
	return line.trim() === "```";
}

/**
 *
 * @param line
 */
function checkIfLineIsOpeningMarkdownBlock(line: string): boolean {
	return [verticalTimelineToken].some(
		(token) => line.trim() === `\`\`\`${token}`
	);
}
