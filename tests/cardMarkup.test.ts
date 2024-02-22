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
			// Add fake note metadata block
			formatBodyForCard(
				SETTINGS_DEFAULT,
				"---\n---\n" + bodyMock + timelineTextMock
			)
		).toContain(bodyMock);
	});

	test("[formatBodyForCard] - ok end of body", () => {
		const bodyMock = `Some sample ${SETTINGS_DEFAULT.inlineEventEndOfBodyMarker} body data`;
		const timelineTextMock = "\n```aat-vertical\nother timeline\n```";

		expect(
			// Add fake note metadata block
			formatBodyForCard(
				SETTINGS_DEFAULT,
				`---\n---\n${bodyMock}${timelineTextMock}`
			)
		).not.toContain("body data");
	});

        test("[formatBodyForCard] - showNoteHeadersInCardBody True", () => {
		const bodyMock = `Some sample ## Header Title\n body data`;
		const timelineTextMock = "\n```aat-vertical\nother timeline\n```";

		expect(
			// Add fake note metadata block
			formatBodyForCard(
				SETTINGS_DEFAULT,
				`---\n---\n${bodyMock}${timelineTextMock}`
			)
		).toContain("Header Title");
	});
        
        test("[formatBodyForCard] - showNoteHeadersInCardBody False", () => {
		const bodyMock = `Some sample ## Header Title\n body data`;
		const timelineTextMock = "\n```aat-vertical\nother timeline\n```";
                SETTINGS_DEFAULT.showNoteHeadersInCardBody = false;
		expect(
			// Add fake note metadata block                        
			formatBodyForCard(
				SETTINGS_DEFAULT,
				`---\n---\n${bodyMock}${timelineTextMock}`
			)
		).not.toContain("Header Title");
	});

	test("[createCardFromBuiltContext] - font overrides", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const cardContent = mockCardContext();

		context.settings.bodyFontSize = 111;
		context.settings.titleFontSize = 222;
		context.settings.dateFontSize = 333;

		context.settings.stylizeDateInline = true;

		expect(() =>
			createCardFromBuiltContext(context, cardContent)
		).not.toThrowError();

		context.settings.stylizeDateInline = false;

		expect(() =>
			createCardFromBuiltContext(context, cardContent)
		).not.toThrowError();
	});
});
