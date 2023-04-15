import {
	createElementShort,
	isDefined,
	getChildAtIndexInHTMLElement,
} from "~/utils";

import type { Range } from "~/types";

const availableColors = [
	"red",
	"orange",
	"yellow",
	"green",
	"cyan",
	"blue",
	"purple",
	"pink",
] as const;

export function renderRanges(ranges: Range[], rootElement: HTMLElement) {
	const endDates: (number | true | undefined)[] = availableColors.map(
		() => undefined
	);

	ranges.forEach((range) => {
		const {
			relatedCardData: {
				cardData: { startDate, endDate },
			},
		} = range;

		const offsetIndex = endDates.findIndex(
			(date) => !isDefined(date) || (date !== true && startDate > date)
		);

		// Over the color limit
		if (offsetIndex === -1) return;

		renderSingleRange(range, offsetIndex, rootElement);
		endDates[offsetIndex] = endDate;
	});
}

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
	el.style.backgroundColor = `var(--color-${availableColors[offset]})`;

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
