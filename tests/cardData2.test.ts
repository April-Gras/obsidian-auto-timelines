import "./obsidianMocks";

import { extractCardData, getDataFromNote, getNoteTags } from "~/cardData";
import { SETTINGS_DEFAULT } from "~/settings";
import { mockMarkdownCodeBlockTimelineProcessingContext } from "./obsidianMocks";

describe.concurrent("Card Data", () => {
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

	test("[getDataFromNote] - ko no metaData", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		context.cachedMetadata.frontmatter = undefined;

		expect(await getDataFromNote(context, ["timline"])).toBeUndefined();
	});

	test("[getDataFromNote] - ko render greenlight is false", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		context.cachedMetadata.frontmatter["aat-render-enabled"] = false;

		expect(await getDataFromNote(context, ["timline"])).toBeUndefined();
	});

	test("[getDataFromNote] - ko no timeline tags match", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		// Try with missing timline metadata
		expect(await getDataFromNote(context, ["timline"])).toBeUndefined();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		// Set timeline to nothing
		context.cachedMetadata.frontmatter.timelines = [];

		expect(await getDataFromNote(context, ["timline"])).toBeUndefined();

		context.cachedMetadata.frontmatter.timelines = ["not-timeline"];

		expect(await getDataFromNote(context, ["timline"])).toBeUndefined();
	});

	test("[getDataFromNote] - ok", async () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter.timelines = ["timline"];

		expect(await getDataFromNote(context, ["timline"])).not.toBeUndefined();
	});

	test("[getNoteTags] - ko empty args", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				undefined
			)
		).toStrictEqual([]);
	});

	test("[getNoteTags] - ok frontmater", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		context.cachedMetadata.frontmatter.timelines = ["sample"];
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				undefined
			)
		).toStrictEqual(["sample"]);
	});

	test("[getNoteTags] - ok frontmater", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		const tags = [
			{
				tag: "#sample 2",
				position: context.cachedMetadata.frontmatter.position,
			},
		];

		context.cachedMetadata.frontmatter.timelines = ["sample"];
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample"]);
		context.settings.lookForTagsForTimeline = true;
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2"]);
		context.cachedMetadata.frontmatter.tags = ["sample 3"];
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2", "sample 3"]);
		context.cachedMetadata.frontmatter.tags = "sample 3";
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2", "sample 3"]);
		context.cachedMetadata.frontmatter.tags = undefined;
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2"]);
		context.settings.lookForTagsForTimeline = false;
		expect(
			getNoteTags(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample"]);
	});
});
