import { createNumberDateTokenConfiguration } from "~/utils";

import type { DateFormatCreationFunction } from "~/types";

export const normalDatePreset: DateFormatCreationFunction = () => ({
  name: "normal",
  icon: "globe",
  settings: {
    dateDisplayFormat: "{day}/{month}/{year}",
    dateParserGroupPriority: "year,month,day",
    dateParserRegex: "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
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
