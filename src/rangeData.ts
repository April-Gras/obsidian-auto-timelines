import {
	isDefined,
	findLastIndex,
	lerp,
	inLerp,
	getChildAtIndexInHTMLElement,
	compareAbstractDates,
} from "~/utils";

import type { CompleteCardContext, AbstractDate } from "~/types";

/**
 * Will compute all the data needed to build ranges in the timeline.
 *
 * @param collection - The complete collection of relevant data gathered from notes.
 * @returns the needed  data to build ranges in the timeline.
 */
export function getAllRangeData(collection: CompleteCardContext[]) {
	if (!collection.length) return [];

	return collection.reduce(
		(accumulator, relatedCardData, index) => {
			const {
				context: {
					elements: { timelineRootElement, cardListRootElement },
				},
				cardData: { startDate, endDate },
			} = relatedCardData;

			if (!isDefined(startDate) || !isDefined(endDate)) return accumulator;
			if (endDate !== true && compareAbstractDates(endDate, startDate) < 0)
				return accumulator;

			const timelineLength = timelineRootElement.offsetHeight;
			const targetCard = cardListRootElement.children.item(
				index,
			) as HTMLElement | null;

			// Error handling but should not happen
			if (!targetCard) return accumulator;

			const cardRelativeTopPosition = targetCard.offsetTop;
			let targetPosition: number;

			if (endDate === true) targetPosition = timelineLength;
			else
				targetPosition = findEndPositionForDate(
					endDate,
					collection.slice(index),
					timelineLength,
					cardListRootElement,
					index,
				);

			accumulator.push({
				relatedCardData: {
					...relatedCardData,
					cardData: {
						...relatedCardData.cardData,
						endDate,
						startDate,
					},
				},
				targetPosition,
				cardRelativeTopPosition,
				index,
			} as const);
			return accumulator;
		},
		[] as {
			readonly relatedCardData: CompleteCardContext & {
				cardData: CompleteCardContext["cardData"] & {
					startDate: AbstractDate;
					endDate: AbstractDate | true;
				};
			};
			readonly index: number;
			readonly targetPosition: number;
			readonly cardRelativeTopPosition: number;
		}[],
	);
}
export type FnGetRangeData = typeof getAllRangeData;

/**
 * Finds the end position in pixel relative to the top of the timeline root element for the give endDate of a range.
 *
 * @param date - The target endDate to position on the timeline.
 * @param collection - The collection of cards part of the same timeline.
 * @param timelineLength - The length in pixel of the timeline.
 * @param rootElement - The root HTMLElement of the cardList.
 * @param indexOffset  - Since the date is already sorted by date we can save a little time by skipping all the elements before.
 * @returns The expected position relative to the top of the timeline container for this date range.
 */
export function findEndPositionForDate(
	date: AbstractDate,
	collection: CompleteCardContext[],
	timelineLength: number,
	rootElement: HTMLElement,
	indexOffset: number,
): number {
	if (collection.length <= 1) return timelineLength;

	try {
		const { start, end } = findBoundaries(
			date,
			collection,
			rootElement,
			indexOffset,
		);
		const [inLerpStart, inLerpEnd, targetInLerpDate] = getInLerpValues(
			start.date,
			end.date,
			date,
		);
		const t = inLerp(inLerpStart, inLerpEnd, targetInLerpDate);

		return lerp(start.top, end.top, t);
		// eslint-disable-next-line no-unused-vars
	} catch (_) {
		return timelineLength;
	}
}

/**
 * Gets the values to compute the inlerp needed for range gutter renders.
 *
 * @param a - The start date
 * @param b - The end date
 * @param c - The date in between
 * @returns the first non equal member of a - b when compared from left to right, also returns the same member from c.
 */
export function getInLerpValues(
	a: AbstractDate,
	b: AbstractDate,
	c: AbstractDate,
): [number, number, number] {
	for (let index = 0; index < a.length; index++) {
		if (a[index] === b[index]) continue;
		return [a[index], b[index], c[index]];
	}
	return [0, 1, 1];
}

type Boundary = { date: AbstractDate; top: number };
/**
 * Find the position of the last card having a lower start date and the first card with a higher start date relative to the endDate of the evaluated range.
 *
 * @param date - The target endDate to position on the timeline.
 * @param collection - The collection of cards part of the same timeline.
 * @param rootElement - The root HTMLElement of the cardList.
 * @param indexOffset  - Since the date is already sorted by date we can save a little time by skipping all the elements before.
 * @returns The start and end boundaries of the target end date.
 */
export function findBoundaries(
	date: AbstractDate,
	collection: CompleteCardContext[],
	rootElement: HTMLElement,
	indexOffset: number,
): { start: Boundary; end: Boundary } {
	const firstOverIndex = collection.findIndex(({ cardData: { startDate } }) =>
		isDefined(startDate) ? compareAbstractDates(startDate, date) > 0 : false,
	);

	if (firstOverIndex === -1)
		throw new Error(
			"No first over found - Can't draw range since there are no other two start date to referrence it's position",
		);

	const firstLastUnderIndex = findLastIndex(
		collection,
		({ cardData: { startDate } }) =>
			isDefined(startDate) ? compareAbstractDates(startDate, date) <= 0 : false,
	);

	if (firstLastUnderIndex === -1)
		throw new Error(
			"Could not find a firstLastUnderIndex, this means this function was called with un rangeable members",
		);

	const lastUnderIndex = collection.findIndex(
		({ cardData: { startDate } }, _) => {
			return (
				compareAbstractDates(
					startDate,
					collection[firstLastUnderIndex].cardData.startDate,
				) === 0
			);
		},
	);

	if (lastUnderIndex === -1)
		throw new Error(
			"No last under found - Can't draw range since there are no other two start date to referrence it's position",
		);

	const startElement = getChildAtIndexInHTMLElement(
		rootElement,
		lastUnderIndex + indexOffset,
	);
	const startDate = collection[lastUnderIndex].cardData
		.startDate as AbstractDate;
	const startIsMoreThanOneCardAway = lastUnderIndex > 1;
	const shouldOffsetStartToBottomOfCard =
		startIsMoreThanOneCardAway && compareAbstractDates(startDate, date) !== 0;

	return {
		start: {
			top:
				startElement.offsetTop +
				(shouldOffsetStartToBottomOfCard ? startElement.innerHeight : 0),
			date: startDate,
		},
		end: {
			top: getChildAtIndexInHTMLElement(
				rootElement,
				firstOverIndex + indexOffset,
			).offsetTop,
			date: collection[firstOverIndex].cardData.startDate as AbstractDate,
		},
	};
}
