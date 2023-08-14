import "./obsidianMocks";
import { SETTINGS_DEFAULT } from "~/settings";

import { formatAbstractDate, formatDateToken } from "~/abstractDateFormating";
import { DateTokenConfiguration, DateTokenType } from "~/types";
import {
	createNumberDateTokenConfiguration,
	createStringDateTokenConfiguration,
} from "~/utils";

describe.concurrent("Abstract Date Formating", () => {
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

	test("[formatDateToken] - numerical", () => {
		const configuration = createNumberDateTokenConfiguration({
			type: DateTokenType.number,
		});

		expect(formatDateToken(2, configuration)).toBe("02");

		configuration.minLeght = 10;
		expect(formatDateToken(2, configuration)).toBe("0000000002");

		configuration.minLeght = -10;
		expect(formatDateToken(2, configuration)).toBe("2");
	});

	test("[formatDateToken] - string", () => {
		const configuration = createStringDateTokenConfiguration({
			dictionary: ["a", "b", "c", "d"],
		});

		expect(formatDateToken(2, configuration)).toBe("c");
	});

	test("[formatdateToken] - ko", () => {
		const configuration =
			createNumberDateTokenConfiguration() as DateTokenConfiguration;

		// @ts-expect-error
		configuration.type = "unvalid type";
		// @ts-expect-error
		configuration.dictionary = ["a", "b", "c", "d"];
		expect(() => formatDateToken(2, configuration)).toThrowError();
	});
});
