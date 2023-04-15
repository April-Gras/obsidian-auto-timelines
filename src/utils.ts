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

export function isDefined<T>(argument: T | undefined): argument is T {
	return argument !== undefined;
}

export function isDefinedAsString(argument: unknown): argument is string {
	return typeof argument === "string";
}

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

export const lerp = (a: number, b: number, t: number) => a + t * (b - a);
export const inLerp = (a: number, b: number, v: number) => (v - a) / (b - a);

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
