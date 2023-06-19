import "./obsidianMocks";

import { DEFAULT_METADATA_KEYS } from "~/settings";
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
		const output = formatAbstractDate(
			absctractDateMock,
			DEFAULT_METADATA_KEYS
		);

		expect(output).toBe("now");
	});

	test("[formatAbstractDate] - abstract date", () => {
		const absctractDateMock = [1000, 0, 0];
		const settings = { ...DEFAULT_METADATA_KEYS };

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
				DEFAULT_METADATA_KEYS
			)
		).toBe("Start date missing");
	});

	test("[getDateText] - missing end", () => {
		expect(
			getDateText(
				{ startDate: [1000, 0, 0], endDate: undefined },
				DEFAULT_METADATA_KEYS
			)
		).toBe("0/0/1000");
	});

	test("[getDateText] - missing end", () => {
		expect(
			getDateText(
				{ startDate: [1000, 0, 0], endDate: true },
				DEFAULT_METADATA_KEYS
			)
		).toBe("From 0/0/1000 to now");
	});

	test("[createCardFromBuiltContext] - ok", () => {
		const context = mockMarkdownCodeBlockTimelineProcessingContext();
		const cardContent = mockCardContext();

		createCardFromBuiltContext(context, cardContent);
	});
});
