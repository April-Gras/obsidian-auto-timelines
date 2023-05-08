import {
	createElementShort,
	isDefined,
	getChildAtIndexInHTMLElement,
	compareAbstractDates,
} from "~/utils";

import type { Range } from "~/types";

/**
 * The color palette that obsidian defined in it's css bundle.
 * Useful for applying colors to elements programatically.
 */
const AVAILABLE_COLORS = [
	"red",
	"orange",
	"yellow",
	"green",
	"cyan",
	"blue",
	"purple",
	"pink",
] as const;

/**
 * Renders the little stripes in the gutter of the timeline.
 *
 * @param { Range[] } ranges - A collection of ranges.
 * @param { HTMLElement } rootElement - The root of all elements for this complete timeline.
 */
export function renderRanges(ranges: Range[], rootElement: HTMLElement) {
	const endDates: (number[] | true | undefined)[] = AVAILABLE_COLORS.map(
		() => undefined
	);

	ranges.forEach((range) => {
		const {
			relatedCardData: {
				cardData: { startDate, endDate },
			},
		} = range;

		const offsetIndex = endDates.findIndex(
			(date) =>
				!isDefined(date) ||
				(date !== true && compareAbstractDates(startDate, date) > 0)
		);

		// Over the color limit
		if (offsetIndex === -1) return;

		renderSingleRange(range, offsetIndex, rootElement);
		endDates[offsetIndex] = endDate;
	});
}

/**
 * Renders a single range element based off the offset computed previously.
 *
 * @param { Range } param0 - A single range.
 * @param { number } offset - The left offet index for this range.
 * @param { HTMLElement } rootElelement
 */
function renderSingleRange(
	{
		relatedCardData: {
			context: {
				elements: { timelineRootElement, cardListRootElement },
			},
		},
		targetPosition,
		cardRelativeTopPosition,
		index,
	}: Range,
	offset: number,
	rootElelement: HTMLElement
) {
	const el = createElementShort(
		timelineRootElement,
		"div",
		"aat-range-element"
	);

	el.style.height = `${targetPosition - cardRelativeTopPosition}px`;
	el.style.top = `${cardRelativeTopPosition}px`;
	el.style.left = `${offset * 12}px`;
	el.style.backgroundColor = `var(--color-${AVAILABLE_COLORS[offset]})`;

	// Setup highlight link
	const relativeCardClassName = "aat-highlight-relative-card-to-range";

	el.onmouseenter = () => {
		const relativeCard = getChildAtIndexInHTMLElement(
			cardListRootElement,
			index
		);

		relativeCard.classList.add(relativeCardClassName);
	};

	el.onmouseleave = () => {
		const relativeCard = getChildAtIndexInHTMLElement(
			cardListRootElement,
			index
		);

		relativeCard.classList.remove(relativeCardClassName);
	};

	// Setup click event
	el.onclick = () => {
		const el = window.document.querySelector(
			".markdown-reading-view > .markdown-preview-view"
		);

		if (!el) return;

		el.scrollTo({
			top: cardRelativeTopPosition + rootElelement.offsetTop - 8,
			behavior: "smooth",
		});
	};
}
