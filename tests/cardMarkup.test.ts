import "./obsidianMocks";

import { SETTINGS_DEFAULT } from "~/settings";
import {
	mockMarkdownCodeBlockTimelineProcessingContext,
	mockCardContext,
} from "./obsidianMocks";
import {
	getDateText,
	createCardFromBuiltContext,
	formatBodyForCard,
} from "~/cardMarkup";

describe.concurrent("Card Markup", () => {
	test("[getDateText] - missing start", () => {
		expect(
			getDateText(
				{ startDate: undefined, endDate: undefined },
				SETTINGS_DEFAULT
			)
		).toBe("Start date missing");
	});

	test("[getDateText] - missing end", () => {
		expect(
			getDateText(
				{ startDate: [1000, 0, 0], endDate: undefined },
				SETTINGS_DEFAULT
			)
		).toBe("00/00/1000");
	});

	test("[getDateText] - missing end", () => {
		expect(
			getDateText(
				{ startDate: [1000, 0, 0], endDate: true },
				SETTINGS_DEFAULT
			)
		).toBe("From 00/00/1000 to now");
	});

	test("[createCardFromBuiltContext] - ok", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const cardContent = mockCardContext();

		expect(() =>
			createCardFromBuiltContext(context, cardContent)
		).not.toThrowError();

		// @ts-expect-error
		cardContent.body = undefined;
		// @ts-expect-error
		cardContent.imageURL = undefined;
		expect(() =>
			createCardFromBuiltContext(context, cardContent)
		).not.toThrowError();
	});

	test("[formatBodyForCard] - ok has other timelines", () => {
		const bodyMock = "Some sample body data";
		const timelineTextMock = "\n```aat-vertical\nother timeline\n```";

		expect(
			formatBodyForCard,
			// Add fake note metadata block
			"---\n---\n" + bodyMock + timelineTextMock
		);
	});
});
