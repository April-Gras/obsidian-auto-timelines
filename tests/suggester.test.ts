import "./obsidianMocks";
import { TimelineMarkdownSuggester, SuggestionType } from "~/suggester";
import AprilsAutomaticTimelinesPlugin from "~/main";
import { SETTINGS_DEFAULT } from "~/settings";
import { acceptedSettingsOverride } from "~/markdownBlockData";
import {
	mockObsidianApp,
	mockObsidianEditor,
	mockTFile,
	mockGetFileCache,
} from "./obsidianMocks";
import manifest from "~/../manifest.json";
import { mock } from "vitest-mock-extended";
import { Editor, type EditorSuggestContext } from "obsidian";
import { Mock } from "vitest";

/**
 * Quick setup function for this test suite.
 *
 * @returns some test utils.
 */
function quickSetup() {
	const app = mockObsidianApp();
	const plugin = new AprilsAutomaticTimelinesPlugin(app, manifest);
	plugin.settings = SETTINGS_DEFAULT;
	const suggester = new TimelineMarkdownSuggester(plugin);

	suggester.close = vi.fn();
	return { app, plugin, suggester };
}

describe.concurrent("Suggester", () => {
	test("[TimelineMarkdownSuggester] - ko onTrigger simple", () => {
		const { suggester } = quickSetup();
		const editor = mockObsidianEditor();

		// @ts-expect-error
		editor.getRange = vi.fn(() => "some random sting");
		expect(
			suggester.onTrigger({ line: 0, ch: 0 }, editor, mockTFile())
		).toBeNull();

		const line = "more random things";
		// @ts-expect-error
		editor.getRange = vi.fn(
			() => `\`\`\`aat-vertical\nsample\n\`\`\`\n${line}`
		);
		// @ts-expect-error
		editor.getValue = vi.fn(
			() => `\`\`\`aat-vertical\nsample\n\`\`\`\n${line}`
		);
		// @ts-expect-error
		editor.getLine = vi.fn(() => line);
		expect(
			suggester.onTrigger({ line: 0, ch: 0 }, editor, mockTFile())
		).toBeNull();
	});

	test("[TimelineMarkdownSuggester] - ok onTrigger simple", () => {
		const { suggester } = quickSetup();
		const editor = mockObsidianEditor();
		let line = "sometimelineName";
		const expected = {
			end: { line: 1, ch: line.length - 1 },
			start: { ch: 0, line: 1 },
			query: line,
		};

		// @ts-expect-error
		editor.getRange = vi.fn(() => `\`\`\`aat-vertical\n${line}\n`);
		// @ts-expect-error
		editor.getValue = vi.fn(() => `\`\`\`aat-vertical\n${line}\n\`\`\``);
		// @ts-expect-error
		editor.getLine = vi.fn(() => line);
		expect(
			suggester.onTrigger(
				{ line: 1, ch: line.length - 1 },
				editor,
				mockTFile()
			)
		).toStrictEqual(expected);

		line = "titleFontSize: ";

		expected.query = " ";
		expected.end = { ch: line.indexOf(":") + 1, line: 2 };
		expected.start = { ch: "titleFontSize: ".length - 1, line: 2 };
		// @ts-expect-error
		editor.getValue = vi.fn(
			() => `\`\`\`aat-vertical\ntimelineName\n${line}\n`
		);
		expect(
			suggester.onTrigger(expected.end, editor, mockTFile())
		).toStrictEqual(expected);
	});

	const testArray = [
		"applyAdditonalConditionFormatting: ",
		"bodyFontSize:     			 ",
		"dateDisplayFormat:",
		"dateFontSize:  ",
		"titleFontSize:    ",
		"cringeKey:  ",
		"stylizeDateInline: ",
	];
	const expectArray = [
		SuggestionType.ApplyConditionalFormatingOption,
		SuggestionType.FontSizeBodyOption,
		SuggestionType.DateFormatOption,
		SuggestionType.FontSizeDateOption,
		SuggestionType.FontSizeTitleOption,
		SuggestionType.AnyOption,
		SuggestionType.StylizeDateInlineOption,
	];
	for (const index in testArray) {
		const line = testArray[index];
		test(`[TimelineMarkdownSuggester] - ok onTrigger enum${expectArray[index]}`, () => {
			const { suggester } = quickSetup();
			const editor = mockObsidianEditor();

			// @ts-expect-error
			editor.getRange = vi.fn(
				() => `\`\`\`aat-vertical\ntimelineName\n${line}`
			);
			// @ts-expect-error
			editor.getValue = vi.fn(
				() => `\`\`\`aat-vertical\ntimelineName\n${line}\`\`\``
			);
			// @ts-expect-error
			editor.getLine = vi.fn(() => line);
			suggester.onTrigger(
				{ line: 2, ch: line.length - 1 },
				editor,
				mockTFile()
			);
			expect(suggester.onTriggerParsedContent?.type).toStrictEqual(
				expectArray[index]
			);
		});
	}

	test("[TimelineMarkdownSuggester] - ok getSuggestions fluke", () => {
		const { suggester } = quickSetup();
		const context = mock<EditorSuggestContext>();

		context.query = "";
		expect(suggester.getSuggestions(context)).toStrictEqual([]);
	});

	test("[TimelineMarkdownSuggester] - ok getSuggestions TagToFind", () => {
		const { app, suggester } = quickSetup();
		app.vault.getMarkdownFiles = vi.fn(() => [
			mockTFile("timeline2"),
			mockTFile("timeline"),
		]);
		app.metadataCache.getFileCache =
			mockGetFileCache().mockImplementationOnce(() => ({
				frontmatter: undefined,
			}));
		const context = mock<EditorSuggestContext>();

		context.query = "ti";
		suggester.onTriggerParsedContent = {
			block: {
				tagsToFind: ["timeline32"],
				settingsOverride: {},
			},
			type: SuggestionType.TagToFind,
		};
		expect(suggester.getSuggestions(context)).toStrictEqual(["timeline"]);
	});

	test("[TimelineMarkdownSuggester] - ok getSuggestions AnyOption", () => {
		const { suggester } = quickSetup();
		const context = mock<EditorSuggestContext>();

		context.query = "";
		suggester.onTriggerParsedContent = {
			block: {
				tagsToFind: [],
				settingsOverride: {
					applyAdditonalConditionFormatting: true,
				},
			},
			type: SuggestionType.AnyOption,
		};
		expect(suggester.getSuggestions(context)).toStrictEqual(
			[...acceptedSettingsOverride]
				.sort((a, b) => a.localeCompare(b))
				.filter((e) => e !== "applyAdditonalConditionFormatting")
		);
		context.query = "size";
		expect(suggester.getSuggestions(context)).toStrictEqual(
			[...acceptedSettingsOverride]
				.sort((a, b) => a.localeCompare(b))
				.filter((str) =>
					str.toLowerCase().includes(context.query.toLowerCase())
				)
		);
	});

	for (const type of [
		SuggestionType.ApplyConditionalFormatingOption,
		SuggestionType.StylizeDateInlineOption,
	]) {
		test(`[TimelineMarkdownSuggester] - ok getSuggestions enum${type}`, () => {
			const { suggester } = quickSetup();
			const context = mock<EditorSuggestContext>({
				query: "",
			});

			suggester.onTriggerParsedContent = {
				block: {
					tagsToFind: [],
					settingsOverride: {},
				},
				type,
			};

			expect(suggester.getSuggestions(context)).toStrictEqual([
				"false",
				"true",
			]);

			context.query = "ue";
			expect(suggester.getSuggestions(context)).toStrictEqual(["true"]);

			context.query = "   UE    ";
			expect(suggester.getSuggestions(context)).toStrictEqual(["true"]);

			context.query = "t ue";
			expect(suggester.getSuggestions(context)).toStrictEqual([]);

			context.query = "als";
			expect(suggester.getSuggestions(context)).toStrictEqual(["false"]);
		});
	}

	const sizeOptionTypes = [
		SuggestionType.FontSizeBodyOption,
		SuggestionType.FontSizeDateOption,
		SuggestionType.FontSizeTitleOption,
	];
	for (const suggestionType of sizeOptionTypes) {
		test(`[TimelineMarkdownSuggester] - ok getSuggestions FontSize*Option - enum${suggestionType}`, () => {
			const { suggester } = quickSetup();
			const context = mock<EditorSuggestContext>({
				query: "4",
			});

			suggester.onTriggerParsedContent = {
				block: {
					tagsToFind: [],
					settingsOverride: {},
				},
				type: suggestionType,
			};
			expect(suggester.getSuggestions(context)).toStrictEqual([
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"10",
				"11",
				"12",
				"13",
			]);

			context.query = "";
			const defaultSet = [
				"10",
				"11",
				"12",
				"13",
				"14",
				"15",
				"16",
				"17",
				"18",
				"19",
			];
			expect(suggester.getSuggestions(context)).toStrictEqual(defaultSet);

			context.query = "clearly not a number";
			expect(suggester.getSuggestions(context)).toStrictEqual(defaultSet);
		});
	}

	test("[TimelineMarkdownSuggester] - ok getSuggestion DateFormatOption", () => {
		const { suggester } = quickSetup();
		const context = mock<EditorSuggestContext>({
			query: "",
		});

		suggester.onTriggerParsedContent = {
			block: {
				tagsToFind: [],
				settingsOverride: {},
			},
			type: SuggestionType.DateFormatOption,
		};
		expect(suggester.getSuggestions(context)).toStrictEqual(
			SETTINGS_DEFAULT.dateTokenConfiguration.map((e) => e.name).sort()
		);

		context.query = "{year} {month}";
		expect(suggester.getSuggestions(context)).toStrictEqual(["day"]);
	});

	test("[TimelineMarkdownSuggester] - renderSuggestions", () => {
		const { suggester } = quickSetup();
		const element = mock<HTMLElement>();

		suggester.renderSuggestion("sample", element);
		expect(element.createSpan).toHaveBeenCalledTimes(0);

		suggester.onTriggerParsedContent = {
			block: {
				tagsToFind: [],
				settingsOverride: {},
			},
			type: SuggestionType.DateFormatOption,
		};
		suggester.renderSuggestion("sample", element);
		expect(element.createSpan).toHaveBeenCalledOnce();
		expect(element.createSpan).toHaveBeenCalledWith({ text: "sample" });
	});

	test("[TimelineMarkdownSuggester] - ko selectSuggestion", () => {
		const { suggester } = quickSetup();

		expect(
			suggester.selectSuggestion("", mock<MouseEvent>())
		).toBeUndefined();
	});

	/**
	 * Another setup function for tests.
	 *
	 * @param query - the query.
	 * @param suggester - the suggester class.
	 * @param type - the type of the suggestion
	 * @param getLine - the get line function mock applied to the obsidian context.
	 */
	function upgradeSuggesterForSelectSuggestionTests(
		query: string,
		suggester: TimelineMarkdownSuggester,
		type: SuggestionType,
		getLine: Mock
	): void {
		suggester.onTriggerParsedContent = {
			block: {
				tagsToFind: [],
				settingsOverride: {},
			},
			type,
		};
		suggester.context = mock<typeof suggester.context>({
			query,
			start: {
				ch: 0,
				line: 0,
			},
			end: {
				ch: 0,
				line: 0,
			},
			editor: mock<Editor>({
				setCursor: vi.fn(),
				replaceRange: vi.fn(),
				getLine,
			}),
		});
	}

	test("[TimelineMarkdownSuggester] - ok selectSuggestion TagsToFind", () => {
		const { suggester } = quickSetup();
		const query = "tag1, tag2, tag3, ta";

		upgradeSuggesterForSelectSuggestionTests(
			query,
			suggester,
			SuggestionType.TagToFind,
			vi.fn(() => query + ", tag4")
		);
		suggester.selectSuggestion("tag4", mock<MouseEvent>());
		expect(suggester.context?.editor.replaceRange).toBeCalledWith(
			"tag1, tag2, tag3, tag4, ",
			suggester.context?.start,
			{
				...(suggester.context?.end || {}),
				ch: query.length + 0,
			},
			"aprils-automatic-timeline"
		);
		expect(suggester.context?.editor.setCursor).toHaveBeenCalled();
	});

	test("[TimelineMarkdownSuggester] - ok selectSuggestion TagsToFind alt", () => {
		const { suggester } = quickSetup();
		const query = "tag1, tag2, tag3, ";

		upgradeSuggesterForSelectSuggestionTests(
			query,
			suggester,
			SuggestionType.TagToFind,
			vi.fn(() => query + ", tag4")
		);
		suggester.selectSuggestion("tag4", mock<MouseEvent>());
		expect(suggester.context?.editor.replaceRange).toBeCalledWith(
			"tag1, tag2, tag3, tag4, ",
			suggester.context?.start,
			{
				...(suggester.context?.end || {}),
				ch: query.length + 0,
			},
			"aprils-automatic-timeline"
		);
		expect(suggester.context?.editor.setCursor).toHaveBeenCalled();
	});

	test("[TimelineMarkdownSuggester] - ok selectSuggestion AnyOption", () => {
		const { suggester } = quickSetup();
		const query = "";

		upgradeSuggesterForSelectSuggestionTests(
			query,
			suggester,
			SuggestionType.AnyOption,
			vi.fn(() => query + "someCoolKey")
		);

		suggester.selectSuggestion("someCoolKey", mock<MouseEvent>());
		expect(suggester.context?.editor.replaceRange).toBeCalledWith(
			"someCoolKey: ",
			suggester.context?.start,
			{
				...(suggester.context?.end || {}),
				ch: query.length + 0,
			},
			"aprils-automatic-timeline"
		);
		expect(suggester.context?.editor.setCursor).toHaveBeenCalled();
	});

	for (const optionValueType of [
		...sizeOptionTypes,
		SuggestionType.ApplyConditionalFormatingOption,
		SuggestionType.StylizeDateInlineOption,
	]) {
		test(`[TimelineMarkdownSuggester] - ok selectSuggestion enum${optionValueType}`, () => {
			const { suggester } = quickSetup();
			const query = "somecoolkey: ";

			upgradeSuggesterForSelectSuggestionTests(
				query,
				suggester,
				optionValueType,
				vi.fn(() => query + "a coolValue")
			);

			suggester.selectSuggestion("a coolValue", mock<MouseEvent>());
			expect(suggester.context?.editor.replaceRange).toBeCalledWith(
				" a coolValue\n",
				suggester.context?.start,
				{
					...(suggester.context?.end || {}),
					ch: query.length + 0,
				},
				"aprils-automatic-timeline"
			);
			expect(suggester.context?.editor.setCursor).toHaveBeenCalled();
		});
	}

	test("[TimelineMarkdownSuggester] - ok selectSuggestion enum${optionValueType}", () => {
		const { suggester } = quickSetup();
		const query = "somecoolkey: ";

		upgradeSuggesterForSelectSuggestionTests(
			query,
			suggester,
			SuggestionType.DateFormatOption,
			vi.fn(() => query + "{aCoolToken}")
		);

		suggester.selectSuggestion("aCoolToken", mock<MouseEvent>());
		expect(suggester.context?.editor.replaceRange).toBeCalledWith(
			"somecoolkey: {aCoolToken}",
			suggester.context?.start,
			{
				...(suggester.context?.end || {}),
				ch: query.length + 0,
			},
			"aprils-automatic-timeline"
		);
		expect(suggester.context?.editor.setCursor).toHaveBeenCalled();
	});
});
