import { isDefined, findLastIndex } from "~/utils";

import type { CompleteCardContext, CardContent } from "~/types";

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
type ObsidianColor = typeof availableColors[number];

export function evaluateTimelineGutterCreationFromContexts(
	collection: CompleteCardContext[]
): void {
	if (!collection.length) return;

	for (let index = 0; index < collection.length; index++) {
		const {
			context: {
				elements: { timelineRootElement, cardListRootElement },
			},
			cardData: { startDate, endDate },
		} = collection[index];

		if (!isDefined(startDate) || !isDefined(endDate) || endDate === false)
			continue;
		if (endDate !== true && endDate < startDate) continue;

		const timelineLength = timelineRootElement.offsetHeight;
		const targetCard = cardListRootElement.children.item(
			index
		) as HTMLElement | null;

		// Error handling but should not happen
		if (!targetCard) continue;

		const cardRelativeTopPosition = targetCard.offsetTop;
		let targetPosition: number;

		if (endDate === true) targetPosition = timelineLength;
		else
			targetPosition = findEndPositionForDate(
				endDate,
				collection.slice(index),
				timelineLength,
				cardListRootElement,
				index
			);

		const el = timelineRootElement.createDiv();

		el.style.height = `${targetPosition - cardRelativeTopPosition}px`;
		el.style.top = `${cardRelativeTopPosition}px`;
		el.style.left = `${index * 6}px`;
		el.style.position = "absolute";
		el.style.backgroundColor = "orange";
		el.style.width = "4px";
	}
}

function findEndPositionForDate(
	date: number,
	collection: CompleteCardContext[],
	timelineLength: number,
	rootElement: HTMLElement,
	indexOffset: number
) {
	if (collection.length <= 1) return timelineLength;

	try {
		const { start, end } = findBoundaries(
			date,
			collection,
			rootElement,
			indexOffset
		);
		const t = inLerp(start.date, end.date, date);

		console.log({ start, end });
		return lerp(start.top, end.top, t);
	} catch (_) {
		return timelineLength;
	}
}

type Boundary = { date: number; top: number };
const findBoundaries = (
	date: number,
	collection: CompleteCardContext[],
	rootElement: HTMLElement,
	indexOffset: number
): { start: Boundary; end: Boundary } => {
	const firstOverIndex = collection.findIndex(({ cardData: { startDate } }) =>
		isDefined(startDate) ? startDate > date : false
	);

	if (firstOverIndex === -1)
		throw new Error(
			"No first over found - Can't draw range since there are no other two start date to referrence it's position"
		);

	const lastUnderIndex = findLastIndex(
		collection,
		({ cardData: { startDate } }) =>
			isDefined(startDate) ? startDate <= date : false
	);

	if (lastUnderIndex === -1)
		throw new Error(
			"No last under found - Can't draw range since there are no other two start date to referrence it's position"
		);

	return {
		start: {
			top: getChildAtIndexInHTMLElement(
				rootElement,
				lastUnderIndex + indexOffset
			).offsetTop,
			date: collection[lastUnderIndex].cardData.startDate as number,
		},
		end: {
			top: getChildAtIndexInHTMLElement(
				rootElement,
				firstOverIndex + indexOffset
			).offsetTop,
			date: collection[firstOverIndex].cardData.startDate as number,
		},
	};
};

function getChildAtIndexInHTMLElement(
	el: HTMLElement,
	index: number
): HTMLElement {
	const child = el.children.item(index) as HTMLElement | null;

	if (!child) throw new Error(`Missing child @ index ${index} for element`);
	return child;
}

const lerp = (a: number, b: number, t: number) => a + t * (b - a);
const inLerp = (a: number, b: number, v: number) => (v - a) / (b - a);

type DefinedMetadata = {
	startDate: Exclude<CardContent["startDate"], undefined>;
	endDate: Exclude<CardContent["endDate"], undefined | false>;
};
function reasignEndDate(e: DefinedMetadata["endDate"]) {
	return e === true ? Infinity : e;
}

const normalize = (val: number, max: number, min = 0) =>
	(val - min) / (max - min);

function hasDateOverlap(
	{ startDate: sA, endDate: eA }: DefinedMetadata,
	{ startDate: sB, endDate: eB }: DefinedMetadata
) {
	eA = reasignEndDate(eA);
	eB = reasignEndDate(eB);

	return (sA <= eB && sA >= sB) || (sB <= eA && sB >= sA);
}
