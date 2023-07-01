import "./obsidianMocks";

import { SETTINGS_DEFAULT } from "~/settings";
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
			SETTINGS_DEFAULT
		);

		expect(data.length).toBe(1);
		expect(ObsidianAppMock.metadataCache.getFileCache).toBeCalledTimes(2);
		expect(ObsidianAppMock.vault.getMarkdownFiles).toBeCalledTimes(1);
		expect(data[0].settings).toBe(SETTINGS_DEFAULT);
		expectTypeOf(
			// @ts-expect-error
			data[0].cachedMetadata.frontmatter[
				SETTINGS_DEFAULT.metadataKeyEventStartDate
			]
		).toMatchTypeOf<number>();
	});
});
