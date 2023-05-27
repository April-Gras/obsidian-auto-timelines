import "./obsidianMocks";

import { DEFAULT_METADATA_KEYS } from "~/settings";
import { setupTimelineCreation } from "~/timelineMarkup";
import { mockObsidianApp, mockHTMLElement } from "./obsidianMocks";

describe.concurrent("Timeline Markup", () => {
	test("[setupTimelineCreation] - ok", () => {
		const ObsidianAppMock = mockObsidianApp();
		const HTMLElementMock = mockHTMLElement();
		const data = setupTimelineCreation(
			ObsidianAppMock,
			HTMLElementMock,
			"sample",
			DEFAULT_METADATA_KEYS
		);

		expect(data.length).toBe(1);
		expect(ObsidianAppMock.metadataCache.getFileCache).toBeCalledTimes(2);
		expect(ObsidianAppMock.vault.getMarkdownFiles).toBeCalledTimes(1);
		expect(data[0].settings).toBe(DEFAULT_METADATA_KEYS);
		expectTypeOf(
			// @ts-expect-error
			data[0].cachedMetadata.frontmatter[
				DEFAULT_METADATA_KEYS.metadataKeyEventStartDate
			]
		).toMatchTypeOf<number>();
	});
});
