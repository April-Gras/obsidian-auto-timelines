import { SETTINGS_DEFAULT } from "~/settings";
import { AutoTimelineSettings } from "./types";
import { isDefined, isDefinedAsString } from "./utils";

/**
 * Fetches the tags to find and timeline specific settings override.
 *
 * @param source - The markdown code block source, a.k.a. the content inside the code block.
 * @returns Partial settings to override the global ones.
 */
export function parseMarkdownBlockSource(source: string): {
	readonly tagsToFind: string[];
	readonly settingsOverride: Partial<AutoTimelineSettings>;
} {
	const sourceEntries = source.split("\n");

	if (!source.length)
		return { tagsToFind: [] as string[], settingsOverride: {} } as const;
	const tagsToFind = sourceEntries[0]
		.split(SETTINGS_DEFAULT.markdownBlockTagsToFindSeparator)
		.map((e) => e.trim());

	sourceEntries.shift();
	return {
		tagsToFind,
		settingsOverride: sourceEntries.reduce((accumulator, element) => {
			return {
				...accumulator,
				...parseSingleLine(element),
			};
		}, {} as Partial<AutoTimelineSettings>),
	} as const;
}

const acceptedSettingsOverride = ["dateDisplayFormat"] as const;
type OverridableSettingKey = (typeof acceptedSettingsOverride)[number];

/**
 * Checks if a given string is part of the settings keys that can be overriden.
 *
 * @param value - A given settings key.
 * @returns the typeguard boolean `true` if the key is indeed overridable.
 */
function isOverridableSettingsKey(
	value: string
): value is OverridableSettingKey {
	// @ts-expect-error
	return acceptedSettingsOverride.includes(value);
}

/**
 * Will apply the needed formatting to a setting value based of it's key.
 *
 * @param key - The settings key.
 * @param value - The value associated to this value.
 * @returns Undefined if unvalid or the actual expected value.
 */
function formatValueFromKey(
	key: string,
	value: string
): AutoTimelineSettings[OverridableSettingKey] | undefined {
	if (!isOverridableSettingsKey(key)) return undefined;
	if (isDefinedAsString(SETTINGS_DEFAULT[key])) return value;
	return undefined;
}

/**
 * Parse a single line of the timeline markdown block content.
 *
 * @param line - The line to parse.
 * @returns A potencialy partial settings object.
 */
function parseSingleLine(line: string): Partial<AutoTimelineSettings> {
	const reg = /((?<key>(\s|\d|[a-z])*):(?<value>.*))/i;
	const matches = line.match(reg);

	if (
		!matches ||
		!matches.groups ||
		!isDefinedAsString(matches.groups.key) ||
		!isDefined(matches.groups.value)
	)
		return {};

	const key = matches.groups.key.trim();
	const value = formatValueFromKey(key, matches.groups.value.trim());

	if (!isDefined(value)) return {};
	return { [key]: value };
}
