import "./obsidianMocks";
import { vi } from "vitest";

import { mockCompleteCardContext, mockHTMLElement } from "./obsidianMocks";

import {
	findBoundaries,
	getInLerpValues,
	findEndPositionForDate,
	getAllRangeData,
} from "~/rangeData";

describe.concurrent("Range Data", () => {
	test("[findBoundaries] - ko no start", () => {
		expect(() =>
			findBoundaries(
				[5],
				[mockCompleteCardContext()],
				mockHTMLElement(),
				0
			)
		).toThrowError(
			"No first over found - Can't draw range since there are no other two start date to referrence it's position"
		);
	});

	test("[findBoundaries] - ko no first last under", () => {
		expect(() =>
			findBoundaries(
				[5],
				[
					mockCompleteCardContext({
						cardData: {
							startDate: [6],
						},
					}),
				],
				mockHTMLElement(),
				0
			)
		).toThrowError(
			"Could not find a firstLastUnderIndex, this means this function was called with un rangeable members"
		);
	});

	test("[findBoundaries] - ko no end", () => {
		expect(() =>
			findBoundaries(
				[5],
				[
					mockCompleteCardContext({
						cardData: {
							startDate: [5],
						},
					}),
					mockCompleteCardContext({
						cardData: {
							startDate: undefined,
						},
					}),
					mockCompleteCardContext({
						cardData: {
							startDate: [8],
						},
					}),
				],
				mockHTMLElement(),
				0
			)
		).toThrowError("Missing child @ index 2 for element");
	});

	test("[findBoundaries] - ok", () => {
		const element = mockHTMLElement();
		const collection = [
			mockCompleteCardContext({
				cardData: {
					startDate: [2],
				},
			}),
			mockCompleteCardContext({
				cardData: {
					startDate: [3],
				},
			}),
			mockCompleteCardContext({
				cardData: {
					startDate: [4],
				},
			}),
			mockCompleteCardContext({
				cardData: {
					startDate: [6],
				},
			}),
		];

		element.children.item = vi.fn(mockHTMLElement);
		expect(() =>
			findBoundaries([5], collection, element, 0)
		).not.toThrowError();
	});

	test("[findBoundaries] - should not offset start position", () => {
		const element = mockHTMLElement();
		const collection = [
			mockCompleteCardContext({
				cardData: {
					startDate: [3],
				},
			}),
			mockCompleteCardContext({
				cardData: {
					startDate: [4],
				},
			}),
			mockCompleteCardContext({
				cardData: {
					startDate: [6],
				},
			}),
		];

		element.children.item = vi.fn(mockHTMLElement);
		expect(() =>
			findBoundaries([5], collection, element, 0)
		).not.toThrowError();
	});

	test("[getInLerpValues] - ok", () => {
		expect(
			getInLerpValues(
				[1, 1, 1, 1, 1, 1, 1, 5],
				[1, 1, 1, 1, 1, 1, 1, 45],
				[]
			)
		).toStrictEqual([5, 45, undefined]);

		expect(
			getInLerpValues(
				[1, 1, 1, 1, 1, 1, 1, 5],
				[1, 1, 1, 1, 1, 1, 1, 45],
				[1, 1, 1, 1, 1, 1, 1, 43]
			)
		).toStrictEqual([5, 45, 43]);

		expect(
			getInLerpValues(
				[1, 1, 1, 1, 1, 1, 1, 5],
				[1, 1, 1, 1, 1, 1, 1, 5],
				[1, 1, 1, 1, 1, 1, 1, 43]
			)
		).toStrictEqual([0, 1, 1]);
	});

	test("[findEndPositionForDate] - No collection lenght", () => {
		expect(
			findEndPositionForDate(
				[1],
				[mockCompleteCardContext()],
				420,
				mockHTMLElement(),
				0
			)
		).toBe(420);
	});

	test("[findEndPositionForDate] - Boundary fetch failure", () => {
		expect(
			findEndPositionForDate(
				[1],
				[mockCompleteCardContext(), mockCompleteCardContext()],
				420,
				mockHTMLElement(),
				0
			)
		).toBe(420);
	});

	test("[findEndPositionForDate] - ok", () => {
		const element = mockHTMLElement();

		element.children.item = vi.fn(mockHTMLElement);
		expect(
			findEndPositionForDate(
				[3],
				[
					mockCompleteCardContext({
						cardData: {
							startDate: [1],
						},
					}),
					mockCompleteCardContext({
						cardData: {
							startDate: [2],
						},
					}),
					mockCompleteCardContext({
						cardData: {
							startDate: [4],
						},
					}),
				],
				420,
				element,
				0
			)
		).toBe(0);
	});

	test("[getAllRangeData] - ko no collection length", () => {
		expect(getAllRangeData([])).toStrictEqual([]);
	});

	test("[getAllRangeData] - ko no start date", () => {
		expect(
			getAllRangeData([
				mockCompleteCardContext({
					context: {
						elements: {
							timelineRootElement: mockHTMLElement(),
						},
					},
				}),
			])
		).toStrictEqual([]);
	});

	test("[getAllRangeData] - ko no end date", () => {
		expect(
			getAllRangeData([
				mockCompleteCardContext({
					context: {
						elements: {
							timelineRootElement: mockHTMLElement(),
							cardListRootElement: mockHTMLElement(),
						},
					},
					cardData: {
						startDate: [1],
					},
				}),
			]).length
		).toBe(1);
	});

	test("[getAllRangeData] - ok end date under start date", () => {
		expect(
			getAllRangeData([
				mockCompleteCardContext({
					context: {
						elements: {
							timelineRootElement: mockHTMLElement(),
							cardListRootElement: mockHTMLElement(),
						},
					},
					cardData: {
						startDate: [1],
						endDate: [0],
					},
				}),
			]).length
		).toBe(0);
	});

	test("[getAllRangeData] - ko missing HTMLElements", () => {
		const element = mockHTMLElement();

		element.children.item = vi.fn(() => null);
		expect(
			getAllRangeData([
				mockCompleteCardContext({
					context: {
						elements: {
							timelineRootElement: element,
							cardListRootElement: element,
						},
					},
					cardData: {
						startDate: [1],
						endDate: true,
					},
				}),
			]).length
		).toBe(0);
	});

	test("[getAllRangeData] - ok end date is infinite", () => {
		const element = mockHTMLElement();

		expect(
			getAllRangeData([
				mockCompleteCardContext({
					context: {
						elements: {
							timelineRootElement: element,
							cardListRootElement: element,
						},
					},
					cardData: {
						startDate: [1],
						endDate: true,
					},
				}),
			]).length
		).toBe(1);
	});
});
