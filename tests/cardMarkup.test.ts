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
	formatDateToken,
} from "~/cardMarkup";
import { DateTokenConfiguration, DateTokenType } from "~/types";
import { createDefaultDateConfiguration } from "~/utils";

describe.concurrent("Card Markup", () => {
	test("[formatAbstractDate] - boolean date", () => {
		const absctractDateMock = true;
		const output = formatAbstractDate(absctractDateMock, SETTINGS_DEFAULT);

		expect(output).toBe("now");
	});

	test("[formatAbstractDate] - throws on missing configuration", () => {
		const absctractDateMock = [1000, 0, 0];
		const settings = { ...SETTINGS_DEFAULT };

		settings.dateTokenConfiguration = [];

		expect(() =>
			formatAbstractDate(absctractDateMock, settings)
		).toThrowError();
	});

	test("[formatAbstractDate] - abstract date", () => {
		const absctractDateMock = [1000, 0, 0];
		const settings = { ...SETTINGS_DEFAULT };

		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			"00/00/1000"
		);
		settings.dateDisplayFormat = "{month}-{year}-{day}";
		expect(formatAbstractDate(absctractDateMock, settings)).toBe(
			"00-1000-00"
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

	test("[formatDateToken] - numerical", () => {
		const configuration = createDefaultDateConfiguration();

		expect(formatDateToken(2, configuration)).toBe("02");

		configuration.minLeght = 10;
		expect(formatDateToken(2, configuration)).toBe("0000000002");

		configuration.minLeght = -10;
		expect(formatDateToken(2, configuration)).toBe("2");
	});

	test("[formatDateToken] - string", () => {
		const configuration = createDefaultDateConfiguration();

		// @ts-expect-error
		configuration.type = DateTokenType.string;
		// @ts-expect-error
		configuration.dictionary = ["a", "b", "c", "d"];
		expect(formatDateToken(2, configuration)).toBe("c");
	});

	test("[formatdateToken] - ko", () => {
		const configuration =
			createDefaultDateConfiguration() as DateTokenConfiguration;

		// @ts-expect-error
		configuration.type = "unvalid type";
		// @ts-expect-error
		configuration.dictionary = ["a", "b", "c", "d"];
		expect(() => formatDateToken(2, configuration)).toThrowError();
	});
});
