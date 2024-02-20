import { createNumberDateTokenConfiguration } from "~/utils";

import type { DateFormatCreationFunction } from "~/types";

export const imperialDatePreset: DateFormatCreationFunction = () => ({
	name: "imperial",
	icon: "globe",
	settings: {
		dateDisplayFormat: "{month}/{day}/{year}",
		dateParserGroupPriority: "month,year,day",
		dateParserRegex:
			"(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
		applyAdditonalConditionFormatting: true,
		dateTokenConfiguration: [
			createNumberDateTokenConfiguration({
				name: "year",
				minLeght: 4,
			}),
			createNumberDateTokenConfiguration({ name: "month" }),
			createNumberDateTokenConfiguration({ name: "day" }),
		],
	},
});
