import "./obsidianMocks";
import { SETTINGS_DEFAULT } from "~/settings";

import {
	applyConditionBasedFormating,
	formatAbstractDate,
	formatDateToken,
} from "~/abstractDateFormating";
import { Condition, DateTokenConfiguration, DateTokenType } from "~/types";
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

	test("[applyConditionBasedFormating] - ok skip formatting", () => {
		const input = "sample input";

		expect(
			applyConditionBasedFormating(
				input,
				0,
				createNumberDateTokenConfiguration(),
				false
			)
		).toBe(input);
	});

	test("[applyConditionBasedFormating] - ok no formatting", () => {
		const input = "sample input";

		expect(
			applyConditionBasedFormating(
				input,
				0,
				createNumberDateTokenConfiguration(),
				true
			)
		).toBe(input);
	});

	test("[applyConditionBasedFormating] - ok full conditions exclusive", () => {
		const configuration = createNumberDateTokenConfiguration({
			formating: [
				{
					evaluations: [
						{ condition: Condition.Greater, value: 0 },
						{ condition: Condition.Equal, value: -56 },
					],
					conditionsAreExclusive: true,
					formatting: "{value} sample condition formating",
				},
			],
		});
		const input = "sample";

		expect(
			applyConditionBasedFormating(input, -56, configuration, true)
		).toBe(`${input} sample condition formating`);

		expect(
			applyConditionBasedFormating(input, 0, configuration, true)
		).toBe(input);
	});

	test("[applyConditionBasedFormating] - ok full conditions inclusive", () => {
		const configuration = createNumberDateTokenConfiguration({
			formating: [
				{
					evaluations: [
						{ condition: Condition.Less, value: 0 },
						{ condition: Condition.Equal, value: -56 },
					],
					conditionsAreExclusive: false,
					formatting: "{value} sample condition formating",
				},
			],
		});
		const input = "sample";

		expect(
			applyConditionBasedFormating(input, -56, configuration, true)
		).toBe(`${input} sample condition formating`);

		expect(
			applyConditionBasedFormating(input, -435, configuration, true)
		).toBe(input);
	});
});
