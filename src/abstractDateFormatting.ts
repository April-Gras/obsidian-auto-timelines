import {
	dateTokenConfigurationIsTypeNumber,
	dateTokenConfigurationIsTypeString,
	evalNumericalCondition,
} from "~/utils";

import type {
	AutoTimelineSettings,
	AbstractDate,
	DateTokenConfiguration,
	DateTokenType,
	AdditionalDateFormatting,
} from "~/types";

/**
 * Handy function to format an abstract date based on the current settings.
 *
 * @param date - Target date to format.
 * @param param1 - The settings of the plugin.
 * @param param1.dateDisplayFormat - The target format to displat the date in.
 * @param param1.dateParserGroupPriority - The token priority list for the date format.
 * @param param1.dateTokenConfiguration - The configuration for the given date format.
 * @param param1.applyAdditonalConditionFormatting - The boolean toggle to check or not for additional condition based formattings.
 * @returns the formated representation of a given date based off the plugins settings.
 */
export function formatAbstractDate(
	date: AbstractDate | boolean,
	{
		dateDisplayFormat,
		dateParserGroupPriority,
		dateTokenConfiguration,
		applyAdditonalConditionFormatting,
	}: Pick<
		AutoTimelineSettings,
		| "dateDisplayFormat"
		| "dateParserGroupPriority"
		| "dateTokenConfiguration"
		| "applyAdditonalConditionFormatting"
	>
): string {
	if (typeof date === "boolean") return "now";
	const prioArray = dateParserGroupPriority.split(",");
	let output = dateDisplayFormat.toString();

	prioArray.forEach((token, index) => {
		const configuration = dateTokenConfiguration.find(
			({ name }) => name === token
		);

		if (!configuration)
			throw new Error(
				`[April's not so automatic timelines] - No date token configuration found for ${token}, please setup your date tokens correctly`
			);

		output = output.replace(
			`{${token}}`,
			applyConditionBasedFormatting(
				formatDateToken(date[index], configuration),
				date[index],
				configuration,
				applyAdditonalConditionFormatting
			)
		);
	});

	return output;
}

/**
 * Shorthand to format a part of an abstract date.
 *
 * @param datePart - fragment of an abstract date.
 * @param configuration - the configuration bound to that date token.
 * @returns the formated token.
 */
export function formatDateToken(
	datePart: number,
	configuration: DateTokenConfiguration
): string {
	if (dateTokenConfigurationIsTypeNumber(configuration))
		return formatNumberDateToken(datePart, configuration);
	if (dateTokenConfigurationIsTypeString(configuration))
		return formatStringDateToken(datePart, configuration);
	throw new Error(
		`[April's not so automatic timelines] - Corrupted date token configuration, please reset settings`
	);
}

/**
 * This functions processes each tokens additional conditional formatting.
 *
 * @param formatedDate - The previously processed date token.
 * @param date - The numerical value of the token.
 * @param configuration - The configuration of the token.
 * @param configuration.formatting - The formatting array bound to a token configuration.
 * @param applyAdditonalConditionFormatting - The boolean toggle to check or not for additional condition based formattings.
 * @returns the fully formated token ready to be inserted in the output string.
 */
export function applyConditionBasedFormatting(
	formatedDate: string,
	date: number,
	{ formatting }: DateTokenConfiguration,
	applyAdditonalConditionFormatting: AutoTimelineSettings["applyAdditonalConditionFormatting"]
): string {
	if (!applyAdditonalConditionFormatting) return formatedDate;

	return formatting.reduce(
		(output, { format, conditionsAreExclusive, evaluations }) => {
			const evaluationRestult = (
				conditionsAreExclusive ? evaluations.some : evaluations.every
			).bind(evaluations)(
				({
					condition,
					value,
				}: AdditionalDateFormatting["evaluations"][number]) =>
					evalNumericalCondition(condition, date, value)
			);

			if (evaluationRestult) return format.replace("{value}", output);
			return output;
		},
		formatedDate
	);
}

/**
 * Used to quickly format a fragment of an abstract date based off a number typed date token configuration.
 *
 * @param datePart - fragment of an abstract date.
 * @param param1 - A numerical date token configuration to apply.
 * @param param1.minLeght - the minimal length of a numerical date input.
 * @param param1.hideSign - if `true` the date part will be passed to `Math.abs` before anu further formatting.
 * @returns the formated token.
 */
function formatNumberDateToken(
	datePart: number,
	{ minLeght, hideSign }: DateTokenConfiguration<DateTokenType.number>
): string {
	let stringifiedToken = Math.abs(datePart).toString();

	if (minLeght < 0) minLeght = 0;
	while (stringifiedToken.length < minLeght)
		stringifiedToken = "0" + stringifiedToken;

	if (!hideSign && datePart < 0) stringifiedToken = `-${stringifiedToken}`;
	return stringifiedToken;
}

/**
 * Used to quickly format a fragment of an abstract date based off a string typed date token configuration.
 *
 * @param datePart - fragment of an abstract date.
 * @param param1 - A string typed date token configuration to apply.
 * @param param1.dictionary - the relation dictionary for a date string typed token.
 * @returns the formated token.
 */
function formatStringDateToken(
	datePart: number,
	{ dictionary }: DateTokenConfiguration<DateTokenType.string>
): string {
	return dictionary[datePart];
}
