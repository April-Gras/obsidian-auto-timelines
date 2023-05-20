import "./obsidianMocks";

import {
	getAbstractDateFromData,
	getAbstractDateFromMetadata,
} from "~/cardData";
import { DEFAULT_METADATA_KEYS } from "~/settings";
import { mockMarkdownCodeBlockTimelineProcessingContext } from "./obsidianMocks";

describe("Card Data", () => {
	test("[getAbstractDateFromData] - ok", () => {
		const date = getAbstractDateFromData(
			["year", "month", "day"],
			"1000-1000-1000",
			DEFAULT_METADATA_KEYS.dateParserRegex
		);

		expect(date).toStrictEqual([1000, 1000, 1000]);
	});

	test("[getAbstractDateFromData] - faulty regex", () => {
		const date = getAbstractDateFromData(
			["year", "month", "day"],
			"1000-1000-1000",
			"this-regex-will-not-match"
		);

		expect(date).toBeUndefined();
	});

	test("[getAbstractDateFromData] - partial regex match", () => {
		const date = getAbstractDateFromData(
			["year", "month", "day"],
			"1000-1000-1000",
			"(?<year>-?[0-9]*)-"
		);

		expect(date).toBeUndefined();
	});

	test("[getAbstractDateFromMetadata] - ok", () => {
		const date = getAbstractDateFromMetadata(
			mockMarkdownCodeBlockTimelineProcessingContext,
			DEFAULT_METADATA_KEYS["metadataKeyEventStartDate"]
		);
		expect(date).toStrictEqual([1000, 1000, 1000]);
	});

	test("[getAbstractDateFromMetadata] - missing frontmatter data", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext;

		// This will always be true
		if (context.cachedMetadata.frontmatter)
			context.cachedMetadata.frontmatter[
				DEFAULT_METADATA_KEYS.metadataKeyEventStartDate
			] = undefined;

		const date = getAbstractDateFromMetadata(
			context,
			DEFAULT_METADATA_KEYS["metadataKeyEventStartDate"]
		);

		expect(date).toBeUndefined();
	});

	test("[getAbstractDateFromMetadata] - number frontmatter data", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext;

		// This will always be true
		if (context.cachedMetadata.frontmatter)
			context.cachedMetadata.frontmatter[
				DEFAULT_METADATA_KEYS.metadataKeyEventStartDate
			] = 1000;

		const date = getAbstractDateFromMetadata(
			context,
			DEFAULT_METADATA_KEYS["metadataKeyEventStartDate"]
		);

		expect(date).toStrictEqual([1000, 0, 0]);
	});
});
