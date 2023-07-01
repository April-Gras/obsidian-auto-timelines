import "./obsidianMocks";

import {
	getAbstractDateFromData,
	getAbstractDateFromMetadata,
	getImageUrlFromContextOrDocument,
	getBodyFromContextOrDocument,
	extractCardData,
} from "~/cardData";
import { SETTINGS_DEFAULT } from "~/settings";
import { mockMarkdownCodeBlockTimelineProcessingContext } from "./obsidianMocks";
import { vi } from "vitest";

import type { TFile } from "obsidian";

describe.concurrent("Card Data", () => {
	test("[getAbstractDateFromData] - ok", () => {
		const date = getAbstractDateFromData(
			["year", "month", "day"],
			"1000-1000-1000",
			SETTINGS_DEFAULT.dateParserRegex
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
		] = 1000;

		const date = getAbstractDateFromMetadata(
			context,
			SETTINGS_DEFAULT["metadataKeyEventStartDate"]
		);

		expect(date).toStrictEqual([1000, 0, 0]);
	});

	test("[getImageUrlFromContextOrDocument] - ok internal", () => {
		const imageURL = getImageUrlFromContextOrDocument(
			"![[Picture.png]]",
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(imageURL).not.toBeNull();
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

	test("[getBodyFromContextOrDocument]- ok has other timeline", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const bodyMock = "Some sample body data";
		const timelineTextMock = "\n```aat-vertical\nother timeline\n```";

		const body = getBodyFromContextOrDocument(
			// Add fake note metadata block
			"---\n---\n" + bodyMock + timelineTextMock,
			context
		);

		expect(body).toBe(bodyMock);
	});

	test("[extractCardData] - ok no title override", async () => {
		const data = await extractCardData(
			mockMarkdownCodeBlockTimelineProcessingContext()
		);

		expect(data.title).toBe("basename");
	});
});
