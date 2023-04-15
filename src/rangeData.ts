import {
	isDefined,
	findLastIndex,
	lerp,
	inLerp,
	getChildAtIndexInHTMLElement,
} from "~/utils";

import type { CompleteCardContext, Range } from "~/types";

/**
 * Will compute all the data needed to build ranges in the timeline.
 *
 * @param { CompleteCardContext[] } collection - The complete collection of relevant data gathered from notes.
 * @returns { Range[] } the needed  data to build ranges in the timeline.
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

			if (
				!isDefined(startDate) ||
				!isDefined(endDate) ||
				endDate === false
			)
				return accumulator;
			if (endDate !== true && endDate < startDate) return accumulator;

			const timelineLength = timelineRootElement.offsetHeight;
			const targetCard = cardListRootElement.children.item(
				index
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
					index
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
					startDate: number;
					endDate: number | true;
				};
			};
			readonly index: number;
			readonly targetPosition: number;
			readonly cardRelativeTopPosition: number;
		}[]
	);
}
export type FnGetRangeData = typeof getAllRangeData;

/**
 * Finds the end position in pixel relative to the top of the timeline root element for the give endDate of a range.
 *
 * @param { number } date - The target endDate to position on the timeline.
 * @param { CompleteCardContext[] } collection - The collection of cards part of the same timeline.
 * @param { number } timelineLength - The length in pixel of the timeline.
 * @param { HTMLElement } rootElement - The root HTMLElement of the cardList.
 * @param { number } indexOffset  - Since the date is already sorted by date we can save a little time by skipping all the elements before.
 * @returns { number } The expected position relative to the top of the timeline container for this date range.
 */
function findEndPositionForDate(
	date: number,
	collection: CompleteCardContext[],
	timelineLength: number,
	rootElement: HTMLElement,
	indexOffset: number
): number {
	if (collection.length <= 1) return timelineLength;

	try {
		const { start, end } = findBoundaries(
			date,
			collection,
			rootElement,
			indexOffset
		);
		const t = inLerp(start.date, end.date, date);

		return lerp(start.top, end.top, t);
	} catch (_) {
		return timelineLength;
	}
}

type Boundary = { date: number; top: number };
/**
 * Find the position of the last card having a lower start date and the first card with a higher start date relative to the endDate of the evaluated range.
 *
 * @param { number } date - The target endDate to position on the timeline.
 * @param { CompleteCardContext[] } collection - The collection of cards part of the same timeline.
 * @param { HTMLElement } rootElement - The root HTMLElement of the cardList.
 * @param { number } indexOffset  - Since the date is already sorted by date we can save a little time by skipping all the elements before.
 * @returns { Boundary } The start and end boundaries of the target end date.
 */
function findBoundaries(
	date: number,
	collection: CompleteCardContext[],
	rootElement: HTMLElement,
	indexOffset: number
): { start: Boundary; end: Boundary } {
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
}
