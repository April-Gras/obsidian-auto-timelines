import "./obsidianMocks";

import {
	mockHTMLElement,
	mockMarkdownCodeBlockTimelineProcessingContext,
} from "./obsidianMocks";
import {
	compareAbstractDates,
	createElementShort,
	getChildAtIndexInHTMLElement,
	measureTime,
	inLerp,
	lerp,
	findLastIndex,
	isDefinedAsString,
	isDefined,
	getMetadataKey,
	createDefaultDateConfiguration,
} from "~/utils";
import { SETTINGS_DEFAULT } from "~/settings";
import { DateTokenConfiguration, DateTokenType } from "~/types";

describe.concurrent("Utils", () => {
	test("[compareAbstractDates] - no dates", () => {
		expect(compareAbstractDates(undefined, undefined)).toBe(0);
	});

	test("[compareAbstractDates] - only start", () => {
		expect(compareAbstractDates([1], undefined)).toBe(1);
	});

	test("[compareAbstractDates] - only end", () => {
		expect(compareAbstractDates(undefined, [1])).toBe(-1);
	});

	test("[compareAbstractDates] - start is boolean", () => {
		expect(compareAbstractDates(true, [1])).toBe(1);
	});

	test("[compareAbstractDates] - end is boolean", () => {
		expect(compareAbstractDates([1], true)).toBe(-1);
	});

	test("[compareAbstractDates] - both are boolean", () => {
		expect(compareAbstractDates(true, true)).toBe(0);
	});

	test("[compareAbstractDates] - both are abstract dates but equal - 1 deep", () => {
		expect(compareAbstractDates([1], [1])).toBe(0);
	});

	test("[compareAbstractDates] - both are abstract dates but equal - 2 deep", () => {
		expect(compareAbstractDates([1, 1], [1, 1])).toBe(0);
	});

	test("[compareAbstractDates] - both are abstract dates but equal - 10 deep", () => {
		expect(
			compareAbstractDates([1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1])
		).toBe(0);
	});

	test("[compareAbstractDates] - a is further in the future - 3 deep", () => {
		expect(compareAbstractDates([1, -1, 79], [1, -1, 5])).toBe(1);
	});

	test("[compareAbstractDates] - b is further in the future - 3 deep", () => {
		expect(compareAbstractDates([1, -1, 5], [1, -1, 79])).toBe(-1);
	});

	test("[createElementShort] - just the tag", () => {
		const htmlElementMock = mockHTMLElement();
		const output = createElementShort(htmlElementMock, "div");

		expect(output).not.toBeUndefined();
		expect(htmlElementMock.createEl).toHaveBeenCalledOnce();
		expect(htmlElementMock.createEl).toHaveBeenCalledWith("div");
	});

	test("[createElementShort] - string class addition", () => {
		const htmlElementMock = mockHTMLElement();
		const output = createElementShort(htmlElementMock, "div", "hehe");

		expect(output).not.toBeUndefined();
		expect(htmlElementMock.createEl).toHaveBeenCalledOnce();
		expect(htmlElementMock.createEl).toHaveBeenCalledWith("div");
		expect(output.addClass).toHaveBeenCalledOnce();
		expect(output.addClass).toHaveBeenCalledWith("hehe");
	});

	test("[createElementShort] - array class addition", () => {
		const htmlElementMock = mockHTMLElement();
		const output = createElementShort(htmlElementMock, "div", [
			"hehe",
			"haha",
		]);

		expect(output.addClass).toHaveBeenCalledOnce();
		expect(output.addClass).toHaveBeenCalledWith("hehe", "haha");
	});

	test("[createElementShort] - add body but no class", () => {
		const htmlElementMock = mockHTMLElement();
		const output = createElementShort(
			htmlElementMock,
			"div",
			undefined,
			"sample content"
		);

		expect(output.addClass).not.toHaveBeenCalledOnce();
		expect(output.innerHTML).toBe("sample content");
	});

	test("[getChildAtIndexInHTMLElement] - ok/ko", () => {
		const htmlElementMock = mockHTMLElement();

		expect(
			getChildAtIndexInHTMLElement(htmlElementMock, 0)
		).not.toBeUndefined();

		expect(() =>
			getChildAtIndexInHTMLElement(htmlElementMock, 1)
		).toThrowError();
	});

	test("[measureTime] - ok", () => {
		const spyOnTime = vi.spyOn(global.console, "time");
		const spyOnTimeEnd = vi.spyOn(global.console, "timeEnd");
		const name = "timer-name";
		const timer = measureTime(name);

		expect(timer).not.toBeUndefined();
		expect(spyOnTime).toHaveBeenCalledOnce();
		expect(spyOnTime).toHaveBeenCalledWith(
			`[April's automatic timelines] - ${name}`
		);

		timer();
		expect(spyOnTimeEnd).toHaveBeenCalledOnce();
	});

	test("[inLerp] - ok", () => {
		expect(inLerp(0, 1, 1)).toBe(1);
		expect(inLerp(0, 10, 1)).toBe(0.1);
		expect(inLerp(0, 10, 5)).toBe(0.5);
	});

	test("[lerp] - ok", () => {
		expect(lerp(0, 1, 1)).toBe(1);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(0, 10, 5)).toBe(50);
	});

	test("[findLastIndex] - ok", () => {
		const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

		for (let index = 0; index < arr.length - 1; index++)
			expect(findLastIndex(arr, (e) => e === index)).toBe(index);
	});

	test("[findLastIndex] - ko", () => {
		const arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

		expect(findLastIndex(arr, (e) => e === "never-found")).toBe(-1);
		expect(findLastIndex([] as string[], (e) => e === "never-found")).toBe(
			-1
		);
		expect(
			// @ts-expect-error
			findLastIndex(undefined as string[], (e) => e === "never-found")
		).toBe(-1);
	});

	test("[isDefinedAsString] - ok/ko", () => {
		expect(isDefinedAsString("")).toBe(true);
		expect(isDefinedAsString(45)).toBe(false);
	});

	test("[isDefined] - ok/ko", () => {
		expect(isDefined("")).toBe(true);
		expect(isDefined(45)).toBe(true);
		expect(isDefined(null)).toBe(true);
		expect(isDefined({})).toBe(true);
		expect(isDefined([])).toBe(true);
		expect(isDefined(new Map())).toBe(true);
		expect(isDefined(new WeakMap())).toBe(true);
		expect(isDefined(new WeakSet())).toBe(true);
		expect(isDefined(new Set())).toBe(true);
		expect(isDefined(Symbol())).toBe(true);

		expect(isDefined(undefined)).toBe(false);
	});

	test("[getMetadataKey] - ok", () => {
		const { cachedMetadata } =
			mockMarkdownCodeBlockTimelineProcessingContext();

		expect(
			getMetadataKey(
				cachedMetadata,
				SETTINGS_DEFAULT.metadataKeyEventStartDate,
				"number"
			)
		).toBe(undefined);

		expect(
			getMetadataKey(
				cachedMetadata,
				SETTINGS_DEFAULT.metadataKeyEventStartDate,
				"string"
			)
		).toBe("1000-1000-1000");
	});

	test("[getMetadataKey] - ok", () => {
		const { cachedMetadata } =
			mockMarkdownCodeBlockTimelineProcessingContext();

		cachedMetadata.frontmatter = undefined;
		expect(
			getMetadataKey(
				cachedMetadata,
				SETTINGS_DEFAULT.metadataKeyEventStartDate,
				"string"
			)
		).toBeUndefined();
	});

	test("[createDefaultDateConfiguration] - ok", () => {
		expect(createDefaultDateConfiguration()).toStrictEqual({
			minLeght: 2,
			name: "",
			type: DateTokenType.number,
			dictionary: undefined,
		} as DateTokenConfiguration);

		expect(
			createDefaultDateConfiguration({
				name: "sample",
			})
		).toStrictEqual({
			minLeght: 2,
			name: "sample",
			type: DateTokenType.number,
			dictionary: undefined,
		} as DateTokenConfiguration);

		expect(
			createDefaultDateConfiguration({
				name: "sample",
				minLeght: 234,
			})
		).toStrictEqual({
			minLeght: 234,
			name: "sample",
			type: DateTokenType.number,
			dictionary: undefined,
		} as DateTokenConfiguration);
	});
});
