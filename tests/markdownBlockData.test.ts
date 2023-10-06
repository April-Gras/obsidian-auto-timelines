import "./obsidianMocks";

import { parseMarkdownBlockSource } from "~/markdownBlockData";

describe.concurrent("Markdown block data", () => {
	test("[parseMarkdownBlockSource] - ok no additional settings", () => {
		const { tagsToFind, settingsOverride } = parseMarkdownBlockSource(
			'       only-timeline-name     \n    asdjaslkdjasldkja  ajds las jd\n:::Asdsadada2#$@#$"@#$@#$'
		);

		expect(tagsToFind).toStrictEqual(["only-timeline-name"]);
		expect(settingsOverride).toStrictEqual({});
	});

	test("[parseMarkdownBlockSource] - ok empty", () => {
		const { tagsToFind, settingsOverride } = parseMarkdownBlockSource("");

		expect(tagsToFind).toStrictEqual([]);
		expect(settingsOverride).toStrictEqual({});
	});

	test("[parseMarkdownBlockSource] - ok settings", () => {
		const { tagsToFind, settingsOverride } = parseMarkdownBlockSource(
			"timeline-name\ndateDisplayFormat     :     {year}\n      faultyKey: notValid\ndateTokenConfiguration: this is a valid key but the override is not supported yet\napplyAdditonalConditionFormatting: FaLse\napplyAdditonalConditionFormatting: true\nbodyFontSize: 43\ndateFontSize: ClearlyNotANumber"
		);

		expect(tagsToFind).toStrictEqual(["timeline-name"]);
		expect(settingsOverride).toStrictEqual({
			dateDisplayFormat: "{year}",
			applyAdditonalConditionFormatting: true,
			bodyFontSize: 43,
		});
	});

	test("[parseMarkdownBlockSource] - ko settings - faulty value for boolean type", () => {
		expect(
			parseMarkdownBlockSource(
				"timeline-name\ndateDisplayFormat     :     {year}\n      faultyKey: notValid\ndateTokenConfiguration: this is a valid key but the override is not supported yet\napplyAdditonalConditionFormatting: notValidValue"
			).settingsOverride
		).toEqual({
			dateDisplayFormat: "{year}",
		});
	});
});
