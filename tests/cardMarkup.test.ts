import "./obsidianMocks";

import { SETTINGS_DEFAULT } from "~/settings";
import {
	mockMarkdownCodeBlockTimelineProcessingContext,
	mockCardContext,
} from "./obsidianMocks";
import {
	formatAbstractDate,
	getDateText,
	createCardFromBuiltContext,
} from "~/cardMarkup";

describe.concurrent("Card Markup", () => {
	test("[formatAbstractDate] - boolean date", () => {
		const absctractDateMock = true;
		const output = formatAbstractDate(absctractDateMock, SETTINGS_DEFAULT);

		expect(output).toBe("now");
	});

	test("[formatAbstractDate] - abstract date", () => {
		const absctractDateMock = [1000, 0, 0];
		const settings = { ...SETTINGS_DEFAULT };

		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			"0/0/1000"
		);
		settings.dateDisplayFormat = "{month}-{year}-{day}";
		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			"0-1000-0"
		);
		settings.dateDisplayFormat = "{year} hehe test";
		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			"1000 hehe test"
		);
		settings.dateDisplayFormat = "no template in here";
		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			settings.dateDisplayFormat
		);
	});

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
		).toBe("0/0/1000");
	});

	test("[getDateText] - missing end", () => {
		expect(
			getDateText(
				{ startDate: [1000, 0, 0], endDate: true },
				SETTINGS_DEFAULT
			)
		).toBe("From 0/0/1000 to now");
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
});
