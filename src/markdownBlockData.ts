import { SETTINGS_DEFAULT } from "~/settings";
import { AutoTimelineSettings } from "./types";
import {
	isDefined,
	isDefinedAsBoolean,
	isDefinedAsString,
	isDefinedAsNonNaNNumber,
	isDefinedAsArray,
} from "./utils";

/**
 * Fetches the tags to find and timeline specific settings override.
 *
 * @param source - The markdown code block source, a.k.a. the content inside the code block.
 * @returns Partial settings to override the global ones.
 */
export function parseMarkdownBlockSource(source: string | string[]): {
	readonly tagsToFind: string[];
	readonly settingsOverride: Pick<
		Partial<AutoTimelineSettings>,
		OverridableSettingKey
	>;
} {
	const sourceEntries = isDefinedAsArray(source)
		? source
		: source.split("\n");

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
		}, {} as Pick<Partial<AutoTimelineSettings>, OverridableSettingKey>),
	} as const;
}

export type OverridableSettingKey = (typeof acceptedSettingsOverride)[number];
export const acceptedSettingsOverride = [
	"dateDisplayFormat",
	"applyAdditonalConditionFormatting",
	"stylizeDateInline",
	"dateFontSize",
	"titleFontSize",
	"bodyFontSize",
] satisfies (keyof AutoTimelineSettings)[];

/**
 * Checks if a given string is part of the settings keys that can be overriden.
 *
 * @param value - A given settings key.
 * @returns the typeguard boolean `true` if the key is indeed overridable.
 */
export function isOverridableSettingsKey(
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
	key: OverridableSettingKey,
	value: string
): AutoTimelineSettings[OverridableSettingKey] | undefined {
	if (isDefinedAsString(SETTINGS_DEFAULT[key])) return value;
	if (isDefinedAsNonNaNNumber(SETTINGS_DEFAULT[key])) {
		const out = Number(value);
		return isNaN(out) ? undefined : out;
	}
	if (isDefinedAsBoolean(SETTINGS_DEFAULT[key])) {
		const validBooleanStrings = ["true", "false"];

		if (!validBooleanStrings.includes(value.toLocaleLowerCase()))
			return undefined;
		return value.toLocaleLowerCase() === "true" ? true : false;
	}
	return undefined;
}

/**
 * Parse a single line of the timeline markdown block content.
 *
 * @param line - The line to parse.
 * @returns A potencialy partial settings object.
 */
function parseSingleLine(
	line: string
): Pick<Partial<AutoTimelineSettings>, OverridableSettingKey> {
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

	if (!isOverridableSettingsKey(key)) return {};
	const value = formatValueFromKey(key, matches.groups.value.trim());

	if (!isDefined(value)) return {};
	return { [key]: value };
}
