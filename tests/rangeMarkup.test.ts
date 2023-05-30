import "./obsidianMocks";
import { mockHTMLElement, mockRange } from "./obsidianMocks";
import { vi } from "vitest";

import { renderSingleRange, renderRanges } from "~/rangeMarkup";

describe.concurrent("Range Markup", () => {
	test("[renderSingleRange] - ko missing HTML element", () => {
		expect(() =>
			renderSingleRange(mockRange(), 0, mockHTMLElement())
		).toThrowError();
	});

	test("[renderSingleRange] - ok", () => {
		const element = mockHTMLElement();
		const range = mockRange({
			relatedCardData: {
				context: {
					elements: {
						timelineRootElement: element,
						cardListRootElement: element,
					},
				},
			},
		});

		element.children.item = vi.fn(mockHTMLElement);

		const output = renderSingleRange(range, 0, mockHTMLElement());
		expect(output).not.toBeUndefined();

		expect(output.onclick).not.toBeNull();
		expect(output.onmouseenter).not.toBeNull();
		expect(output.onmouseover).not.toBeNull();

		const keepValue = window.document.querySelector;

		// @ts-expect-error
		expect(() => output.onclick()).not.toThrowError();
		window.document.querySelector = vi.fn(mockHTMLElement);
		// @ts-expect-error
		expect(() => output.onclick()).not.toThrowError();
		// @ts-expect-error
		expect(() => output.onmouseleave()).not.toThrowError();
		// @ts-expect-error
		expect(() => output.onmouseenter()).not.toThrowError();
		window.document.querySelector = keepValue;
	});

	test("[renderRanges] - ko no end date", () => {
		expect(() =>
			renderRanges([mockRange()], mockHTMLElement())
		).toThrowError();
	});

	test("[renderRanges] - ok and overflow", () => {
		const element = mockHTMLElement();
		element.children.item = vi.fn(mockHTMLElement);

		const range = mockRange({
			relatedCardData: {
				cardData: {
					startDate: [0],
					endDate: [1],
				},
				context: {
					elements: {
						timelineRootElement: element,
						cardListRootElement: element,
					},
				},
			},
		});
		const range2 = mockRange({
			relatedCardData: {
				cardData: {
					startDate: [2],
					endDate: true,
				},
				context: {
					elements: {
						timelineRootElement: element,
						cardListRootElement: element,
					},
				},
			},
		});
		expect(() =>
			renderRanges(
				[
					range,
					range,
					range,
					range,
					range,
					range,
					range,
					range,
					range,
					range2,
					range2,
				],
				mockHTMLElement()
			)
		).not.toThrowError();
	});
});
