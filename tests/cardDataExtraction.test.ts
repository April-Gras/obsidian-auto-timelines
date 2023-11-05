import "./obsidianMocks";

import { SETTINGS_DEFAULT } from "~/settings";
import { mockMarkdownCodeBlockTimelineProcessingContext } from "./obsidianMocks";
import {
	getAbstractDateFromMetadata,
	getBodyFromContextOrDocument,
	getImageUrlFromContextOrDocument,
	getTagsFromMetadataOrTagObject,
} from "~/cardDataExtraction";

import type { TFile } from "obsidian";

describe.concurrent("Card Data", () => {
	test("[getAbstractDateFromMetadata] - ok", () => {
		const date = getAbstractDateFromMetadata(
			mockMarkdownCodeBlockTimelineProcessingContext(),
			SETTINGS_DEFAULT["metadataKeyEventStartDate"]
		);
		expect(date).toStrictEqual([1000, 1000, 1000]);
	});

	test("[getAbstractDateFromMetadata] - missing frontmatter data", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT.metadataKeyEventStartDate
		] = undefined;

		const date = getAbstractDateFromMetadata(
			context,
			SETTINGS_DEFAULT["metadataKeyEventStartDate"]
		);

		expect(date).toBeUndefined();
	});

	test("[getAbstractDateFromMetadata] - number frontmatter data", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT.metadataKeyEventStartDate
		] = -1000;

		const date = getAbstractDateFromMetadata(
			context,
			SETTINGS_DEFAULT["metadataKeyEventStartDate"]
		);

		expect(date).toStrictEqual([-1000, 0, 0]);
	});

	test("[getImageUrlFromContextOrDocument] - ok internal", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"![[Picture.png]]",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).toBe("sample");
	});

	test("[getImageUrlFromContextOrDocument] - ok external", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"![](https://imgur.com/hehe)",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).not.toBeNull();
	});

	test("[getImageUrlFromContextOrDocument] - ko no picture", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"no pictures to be found in here",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).toBeNull();
	});

	test("[getImageUrlFromContextOrDocument] - ok overrided", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT.metadataKeyEventPictureOverride
		] = "picture.png";
		const imageURL = getImageUrlFromContextOrDocument(
			"no pictures to be found in here",
			context
		);

		expect(imageURL).not.toBeNull();
	});

	test("[getImageUrlFromContextOrDocument] - ko missing obsidian file", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		context.app.metadataCache.getFirstLinkpathDest = vi.fn(
			(linkpath: string, sourcePath: string): TFile | null => null
		);
		const imageURL = getImageUrlFromContextOrDocument(
			"![[Picture.png]]",
			context
		);

		expect(imageURL).toBeNull();
	});

	test("[getImageUrlFromContextOrDocument] - ok has internal and external match - external first", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"![](https://imgur.com/hehe) ![[another.png]]",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).toBe("https://imgur.com/hehe");
	});

	test("[getImageUrlFromContextOrDocument] - ok has internal and external match - internal first", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"![[Picture.png]]\n![](https://imgur.com/hehe)",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).toBe("sample");
	});

	test("[getBodyFromContextOrDocument]- ko empty body", () => {
		const body = getBodyFromContextOrDocument(
			"",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(body).toBeNull();
	});

	test("[getBodyFromContextOrDocument]- ok empty body / overrided", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const bodyMock = "Some sample body data";

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT["metadataKeyEventBodyOverride"]
		] = bodyMock;
		const body = getBodyFromContextOrDocument("", context);

		expect(body).toBe(bodyMock);
	});

	test("[getBodyFromContextOrDocument]- ok has body / overrided", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const bodyMock = "Some sample body data";

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		context.cachedMetadata.frontmatter[
			SETTINGS_DEFAULT["metadataKeyEventBodyOverride"]
		] = bodyMock;
		const body = getBodyFromContextOrDocument(bodyMock + "body", context);

		expect(body).toBe(bodyMock);
	});

	test("[getBodyFromContextOrDocument]- ok has only body", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const bodyMock = "Some sample body data";

		const body = getBodyFromContextOrDocument(
			// Add fake note metadata block
			"---\n---\n" + bodyMock,
			context
		);

		expect(body).toBe(bodyMock);
	});
	test("[getTagsFromMetadataOrTagObject] - ko empty args", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				undefined
			)
		).toStrictEqual([]);
	});

	test("[getTagsFromMetadataOrTagObject] - ok frontmater", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();

		if (!context.cachedMetadata.frontmatter)
			throw new Error("Missing frontmatter in mock");

		context.cachedMetadata.frontmatter.timelines = ["sample"];
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				undefined
			)
		).toStrictEqual(["sample"]);
	});

	test("[getTagsFromMetadataOrTagObject] - ok frontmater", () => {
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
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample"]);
		context.settings.lookForTagsForTimeline = true;
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2"]);
		context.cachedMetadata.frontmatter.tags = ["sample 3"];
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2", "sample 3"]);
		context.cachedMetadata.frontmatter.tags = "sample 3";
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2", "sample 3"]);
		context.cachedMetadata.frontmatter.tags = undefined;
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample", "sample 2"]);
		context.settings.lookForTagsForTimeline = false;
		expect(
			getTagsFromMetadataOrTagObject(
				context.settings,
				context.cachedMetadata.frontmatter,
				tags
			)
		).toStrictEqual(["sample"]);
	});
});
