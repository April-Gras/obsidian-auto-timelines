import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

/**
 * Quick util to read obsidians metadata object with some type safety.
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext["cachedMetadata"] } - cachedMetadata - Obsidians cachedMetadata object.
 * @param { string } key - the sought after key in the obsidian metadata object.
 * @param { "string" | "number" } type - The expected type of the key value.
 * @returns { null | T } The metadata value assigned to the given key or null if unvalidated or missing.
 */
export function getMetadataKey<T extends "string" | "number" | "boolean">(
	cachedMetadata: MarkdownCodeBlockTimelineProcessingContext["cachedMetadata"],
	key: string,
	type: T
):
	| (T extends "string" ? string : T extends "number" ? number : boolean)
	| undefined {
	// Bail if no formatter object or if the key is missing
	if (!cachedMetadata.frontmatter) return undefined;

	return typeof cachedMetadata.frontmatter[key] === type
		? cachedMetadata.frontmatter[key]
		: undefined;
}

/**
 *
 * @param { T | undefined } argument a possibly undefined argument.
 * @returns { boolean } `true` if the element is defined, `false` if not.
 */
export const isDefined = <T>(argument: T | undefined): argument is T =>
	argument !== undefined;

/**
 *
 * @param { T | undefined } argument a possibly undefined argument.
 * @returns { boolean } `true` if the element is indeed a string, `false` if not.
 */
export const isDefinedAsString = (argument: unknown): argument is string =>
	typeof argument === "string";

/**
 * Same as `Array.findIndex()` but going from right to left.
 *
 * @param { unknown[] } arr - An array of values
 * @param { (unknowd)=> boolean  } predicate - An evaluation function that works like the one you feed `.findIndex()`
 * @returns {number} `-1` if no index was found, or the last occurence of the predicament.
 */
export function findLastIndex<T extends unknown[]>(
	arr: T,
	predicate: (arg: T[number]) => boolean
): number {
	const length = arr ? arr.length : 0;
	if (!length) {
		return -1;
	}
	let index = length - 1;

	while (index--) if (predicate(arr[index])) return index;
	return -1;
}

/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 *
 * @description A naive implementation of the linear interpolation function.
 * @param { number } a - First point.
 * @param { number } b - Last point.
 * @param { number } t - From 0f to 1f, represent the percent of advancement.
 * @returns { number } the position between `a` and `b` @ `t`.
 */
export const lerp = (a: number, b: number, t: number) => a + t * (b - a);
/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 *
 * @description The inverse of a lerp.
 * @param { number } a - First point.
 * @param { number } b - Last point.
 * @param { number } v - The desired point to look for.
 * @returns The percent value of advancement for `v`
 */
export const inLerp = (a: number, b: number, v: number) => (v - a) / (b - a);

/**
 * Quick util to measure performance.
 *
 * @param { string } str - Label for the timer.
 * @returns the handler that will close the timer.
 */
export const measureTime = (str: string) => {
	const value = `[April's automatic timelines] - ${str}`;
	console.time(value);

	return () => {
		console.timeEnd(value);
	};
};

/**
 * Shorthand function to get childs of a given HTML Element.
 *
 * @param {HTMLElement} el - Target HTMLElement.
 * @param {number} index - The desired child index.
 * @returns {HTMLElement} - The child at the desired index. If the element is missing the function will throw.
 */
export function getChildAtIndexInHTMLElement(
	el: HTMLElement,
	index: number
): HTMLElement {
	const child = el.children.item(index) as HTMLElement | null;

	if (!child) throw new Error(`Missing child @ index ${index} for element`);
	return child;
}

/**
 * Shorthand function to create an HTMLElement in a given HTMLElement.
 *
 * @param { HTMLElement } el - The root element.
 * @param { keyof HTMLElementTagNameMap } element - The desired HTML tag.
 * @param { string[] | string | undefined } classes - A single or a collection of tags.
 * @param { string | number | undefined } content - The content to inject inside the created element.
 * @returns { HTMLElement } The created element.
 */
export function createElementShort(
	el: HTMLElement,
	element: keyof HTMLElementTagNameMap,
	classes?: string[] | string,
	content?: string | number
) {
	const out = el.createEl(element);

	if (classes instanceof Array) out.addClass(...classes);
	else if (classes) out.addClass(classes);
	if (content !== undefined) out.innerHTML = content.toString();
	return out;
}

export function compareAbstractDates(
	a: number[] | undefined,
	b: number[] | undefined
) {
	// Since could be numbers we can't check with `!`
	if (!isDefined(a) && !isDefined(b)) return 0;
	if (!isDefined(a)) return 1;
	if (!isDefined(b)) return -1;

	for (let index = 0; index < a.length; index++)
		if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
	return 0;
}
