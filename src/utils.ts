import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

/**
 * Quick util to read obsidians metadata object with some type safety.
 *
 * @param { MarkdownCodeBlockTimelineProcessingContext["cachedMetadata"] } - cachedMetadata - Obsidians cachedMetadata object.
 * @param { string } key - the sought after key in the obsidian metadata object.
 * @param { "string" | "number" } type - The expected type of the key value.
 * @returns { null | T } The metadata value assigned to the given key or null if unvalidated or missing.
 */
export function getMetadataKey<T extends "string" | "number">(
	cachedMetadata: MarkdownCodeBlockTimelineProcessingContext["cachedMetadata"],
	key: string,
	type: T
): (T extends "string" ? string : number) | undefined {
	// Bail if no formatter object or if the key is missing
	if (!cachedMetadata.frontmatter) return undefined;

	return typeof cachedMetadata.frontmatter[key] === type
		? cachedMetadata.frontmatter[key]
		: undefined;
}

export function isDefined<T>(argument: T | undefined): argument is T {
	return !!argument;
}
