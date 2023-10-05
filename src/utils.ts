import {
	AbstractDate,
	DateTokenConfiguration,
	MarkdownCodeBlockTimelineProcessingContext,
	DateTokenType,
	Condition,
} from "~/types";

/**
 * Quick util to read obsidians metadata object with some type safety.
 *
 * @param cachedMetadata - cachedMetadata - Obsidians cachedMetadata object.
 * @param key - the sought after key in the obsidian metadata object.
 * @param type - The expected type of the key value.
 * @returns The metadata value assigned to the given key or null if unvalidated or missing.
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
 * Typeguard to check if a value is indeed defined.
 *
 * @param argument a possibly undefined argument.
 * @returns `true` if the element is defined, `false` if not.
 */
export const isDefined = <T>(argument: T | undefined): argument is T =>
	argument !== undefined;

/**
 * Check if a runtime value is defined and is a non NaN number.
 *
 * @param argument a possibly undefined argument.
 * @returns `true` if the element is indeed a non NaN number, `false` if not.
 */
export const isDefinedAsNonNaNNumber = (
	argument: unknown
): argument is number => typeof argument === "number" && !isNaN(argument);

/**
 * Check if a runtime value is defined and is a string.
 *
 * @param argument a possibly undefined argument.
 * @returns `true` if the element is indeed a string, `false` if not.
 */
export const isDefinedAsString = (argument: unknown): argument is string =>
	typeof argument === "string";

/**
 * Check if a runtime value is defined and is a boolean
 *
 * @param argument a possibly undefined argument.
 * @returns `true` if the element is indeed a boolean, `false` if not.
 */
export const isDefinedAsBoolean = (argument: unknown): argument is boolean =>
	typeof argument === "boolean";

/**
 * Same as `Array.findIndex()` but going from right to left.
 *
 * @param arr - An array of values
 * @param predicate - An evaluation function that works like the one you feed `.findIndex()`
 * @returns `-1` if no index was found, or the last occurence of the predicament.
 */
export function findLastIndex<T extends unknown[]>(
	arr: T,
	predicate: (arg: T[number]) => boolean
): number {
	const length = arr ? arr.length : 0;
	if (!length) return -1;
	let index = length - 1;

	while (index--) if (predicate(arr[index])) return index;
	return -1;
}

/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 *
 * @description A naive implementation of the linear interpolation function.
 * @param a - First point.
 * @param b - Last point.
 * @param t - From 0f to 1f, represent the percent of advancement.
 * @returns the position between `a` and `b` @ `t`.
 */
export const lerp = (a: number, b: number, t: number) => a + t * (b - a);
/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 *
 * @description The inverse of a lerp.
 * @param a - First point.
 * @param b - Last point.
 * @param v - The desired point to look for.
 * @returns The percent value of advancement for `v`
 */
export const inLerp = (a: number, b: number, v: number) => (v - a) / (b - a);

/**
 * Quick util to measure performance.
 *
 * @param str - Label for the timer.
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
 * @param el - Target HTMLElement.
 * @param index - The desired child index.
 * @returns - The child at the desired index. If the element is missing the function will throw.
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
 * @param el - The root element.
 * @param element - The desired HTML tag.
 * @param classes - A single or a collection of tags.
 * @param content - The content to inject inside the created element.
 * @returns The created element.
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

/**
 * Compares two Abstract Dates
 *
 * @param a - first Abstract Date
 * @param b - second Abstract Date
 * @returns 0 if they are equal 1 if a > b and -1 if a < b
 */
export function compareAbstractDates(
	a: AbstractDate | undefined | true,
	b: AbstractDate | undefined | true
) {
	// Since could be numbers we can't check with `!`
	if (!isDefined(a) && !isDefined(b)) return 0;
	if (!isDefined(a)) return -1;
	if (!isDefined(b)) return 1;

	if (a === true && b !== true) return 1;
	if (b === true && a !== true) return -1;
	if (a === true && b === true) return 0;
	a = a as AbstractDate;
	b = b as AbstractDate;
	for (let index = 0; index < a.length; index++)
		if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
	return 0;
}

/**
 * Typeguard to check if a value is an array of unknowed sub type.
 *
 * @param value unknowed value.
 * @returns `true` if the element is defined as an array, `false` if not.
 */
export function isDefinedAsArray(value: unknown): value is unknown[] {
	return isDefined(value) && value instanceof Array;
}

/**
 * Typeguard to check if a value is an object of unknowed key values.
 *
 * @param value unknowed value.
 * @returns `true` if the element is defined as an object, `false` if not.
 */
export function isDefinedAsObject(
	value: unknown
): value is { [key: string]: unknown } {
	return isDefined(value) && value instanceof Object;
}

/**
 * Shorthand to quickly get a well typed number date token configuration object.
 *
 * @param defaultValue - Override the values of the return object.
 * @returns DateTokenConfiguration<DateTokenType.number> - A well typed date token configuration object.
 */
export function createNumberDateTokenConfiguration(
	defaultValue: Partial<DateTokenConfiguration<DateTokenType.number>> = {}
): DateTokenConfiguration<DateTokenType.number> {
	return {
		minLeght: 2,
		name: "",
		type: DateTokenType.number,
		displayWhenZero: true,
		formatting: [],
		hideSign: false,
		...defaultValue,
	};
}

/**
 * Shorthand to quickly get a well typed string date token configuration object.
 *
 * @param defaultValue - Override the values of the return object.
 * @returns DateTokenConfiguration<DateTokenType.string> - A well typed date token configuration object.
 */
export function createStringDateTokenConfiguration(
	defaultValue: Partial<DateTokenConfiguration<DateTokenType.string>> = {}
): DateTokenConfiguration<DateTokenType.string> {
	return {
		name: "",
		type: DateTokenType.string,
		dictionary: [""],
		formatting: [],
		...defaultValue,
	};
}

/**
 * Narrow type down to specific subtype for DateTokenConfigurations.
 *
 * @param value - Date token configuration.
 * @returns typeguard.
 */
export function dateTokenConfigurationIsTypeString(
	value: DateTokenConfiguration
): value is DateTokenConfiguration<DateTokenType.string> {
	return value.type === DateTokenType.string;
}

/**
 * Narrow type down to specific subtype for DateTokenConfigurations.
 *
 * @param value - Date token configuration.
 * @returns typeguard.
 */
export function dateTokenConfigurationIsTypeNumber(
	value: DateTokenConfiguration
): value is DateTokenConfiguration<DateTokenType.number> {
	return value.type === DateTokenType.number;
}

/**
 * Parse a string based off user date extract settings.
 *
 * @param groupsToCheck - The token names to check.
 * @param metadataString - The actual extracted data from the frontmatter.
 * @param reg - The user defined regex to apply.
 * @returns The parsed abstract date or nothing.
 */
export function parseAbstractDate(
	groupsToCheck: string[],
	metadataString: string,
	reg: RegExp | string
): AbstractDate | undefined {
	const matches = metadataString.match(reg);

	if (!matches || !matches.groups) return undefined;

	const { groups } = matches;

	const output = groupsToCheck.reduce((accumulator, groupName) => {
		const value = Number(groups[groupName]);

		// In the case of a faulty regex given by the user in the settings
		if (!isNaN(value)) accumulator.push(value);
		return accumulator;
	}, [] as AbstractDate);

	// Malformed payload bail out
	if (output.length !== groupsToCheck.length) return undefined;

	return output;
}

/**
 * Used to quickly assert any programatic conditions configured by the users.
 *
 * @param condition - A specific condition.
 * @param a - Left hand value.
 * @param b - Right hand value.
 * @returns the evaluated boolean.
 */
export function evalNumericalCondition(
	condition: Condition,
	a: number,
	b: number
): boolean {
	switch (condition) {
		case Condition.Equal:
			return a === b;
		case Condition.NotEqual:
			return a !== b;
		case Condition.Greater:
			return a > b;
		case Condition.GreaterOrEqual:
			return a >= b;
		case Condition.Less:
			return a < b;
		case Condition.LessOrEqual:
			return a <= b;
	}
}

/**
 * Finds a specific subset in a given array supports primitive wildcard selections.
 *
 * @param source - Source array. This is where we're checking for a subset.
 * @param subset - The subset we are looking for.
 * @author Inspired from https://stackoverflow.com/a/74080372
 * @returns `true` if we could find the subset in the source array, `false` otherwise
 */
export function isOrderedSubArray(source: string[], subset: string[]): boolean {
	let endsWithWildstar = false;
	if (!subset.length) return true;
	const target = subset[0];
	const builtRegex = target.includes("*")
		? new RegExp(target.replace(/\*/gi, ".*"))
		: null;
	const index = source.findIndex((el) => {
		if (!builtRegex) return el === target;
		const hasMatch = builtRegex.test(el);

		if (!hasMatch) return false;
		if (target[target.length - 1] === "*") endsWithWildstar = true;
		return true;
	});

	return index === -1
		? false
		: endsWithWildstar ||
				isOrderedSubArray(source.slice(index + 1), subset.slice(1));
}

/**
 * Utils to generate a array filled with numbers in order.
 *
 * @param start - The starting point of the numbers in the array.
 * @param size - The size of the array.
 * @returns the filled array.
 */
export function generateNumberArray(start = 0, size = 10) {
	return [...Array(size).keys()].map((i) => start + i);
}
