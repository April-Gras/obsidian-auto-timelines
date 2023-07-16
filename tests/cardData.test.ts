import "./obsidianMocks";

import { extractCardData, getDataFromNoteMetadata } from "~/cardData";
import { SETTINGS_DEFAULT } from "~/settings";
import { mockMarkdownCodeBlockTimelineProcessingContext } from "./obsidianMocks";

describe.concurrent("Card Data", () => {
	test("[extractCardData] - ok no title override", async () => {
		const data = await extractCardData(
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(data.title).toBe("basename");
	});

	test("[extractCardData] - end date is boolean", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT.metadataKeyEventEndDate
		] = false;
		const data = await extractCardData(context);

		expect(data.endDate).toBe(true);
	});

	test("[getDataFromNoteMetadata] - ko no metaData", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		context.cachedMetadata.frontmatter = undefined;

		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).toBeUndefined();
	});

	test("[getDataFromNoteMetadata] - ko render greenlight is false", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		context.cachedMetadata.frontmatter["aat-render-enabled"] = false;

		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).toBeUndefined();
	});

	test("[getDataFromNoteMetadata] - ko no timeline tags match", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		// Try with missing timline metadata
		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).toBeUndefined();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		// Set timeline to nothing
		context.cachedMetadata.frontmatter.timelines = [];

		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).toBeUndefined();

		context.cachedMetadata.frontmatter.timelines = ["not-timeline"];

		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).toBeUndefined();
	});

	test("[getDataFromNoteMetadata] - ok", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter.timelines = ["timline"];

		expect(
			await getDataFromNoteMetadata(context, ["timline"])
		).not.toBeUndefined();
	});
});
