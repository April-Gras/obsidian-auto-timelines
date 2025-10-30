import {
  createNumberDateTokenConfiguration,
  createStringDateTokenConfiguration,
} from "~/utils";
import { Condition } from "~/types";

import type { DateFormatCreationFunction } from "~/types";

export const verboseDayDatePreset: DateFormatCreationFunction = ({ t }) => ({
  name: "verbose-day",
  icon: "pen-tool",
  settings: {
    dateDisplayFormat: "{day} {month} {year}",
    dateParserGroupPriority: "year,month,day",
    dateParserRegex: "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)",
    applyAdditonalConditionFormatting: true,
    dateTokenConfiguration: [
      createNumberDateTokenConfiguration({
        name: "year",
        minLeght: 4,
      }),
      createStringDateTokenConfiguration({
        name: "month",
        dictionary: [
          "invalid 0 index",
          t("months.january"),
          t("months.february"),
          t("months.march"),
          t("months.april"),
          t("months.may"),
          t("months.june"),
          t("months.july"),
          t("months.august"),
          t("months.september"),
          t("months.october"),
          t("months.november"),
          t("months.december"),
        ],
      }),
      createNumberDateTokenConfiguration({
        name: "day",
        minLeght: 1,
        formatting: [
          {
            conditionsAreExclusive: true,
            evaluations: [
              {
                condition: Condition.Equal,
                value: 1,
              },
            ],
            format: "{value}st",
          },
          {
            conditionsAreExclusive: true,
            evaluations: [
              {
                condition: Condition.Equal,
                value: 2,
              },
            ],
            format: "{value}nd",
          },
          {
            conditionsAreExclusive: true,
            evaluations: [
              {
                condition: Condition.Equal,
                value: 3,
              },
            ],
            format: "{value}rd",
          },
          {
            conditionsAreExclusive: true,
            evaluations: [
              {
                condition: Condition.Greater,
                value: 3,
              },
            ],
            format: "{value}th",
          },
        ],
      }),
    ],
  },
});
