import {
  createNumberDateTokenConfiguration,
  createStringDateTokenConfiguration,
} from "~/utils";

import type { DateFormatCreationFunction } from "~/types";

export const dndCalendarOfHarptosDalereckoningDatePreset: DateFormatCreationFunction =
  () => ({
    name: "dnd-calendar-of-harptos-dalereckoning",
    icon: "compass",
    settings: {
      dateDisplayFormat: "{day} {month} {year}D.R. {hour}:{minute}",
      dateParserGroupPriority: "year,month,day,hour,minute",
      dateParserRegex:
        "(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)-(?<hour>-?[0-9]*)-(?<minute>-?[0-9]*)",
      applyAdditonalConditionFormatting: true,
      dateTokenConfiguration: [
        createNumberDateTokenConfiguration({
          name: "year",
          minLeght: 4,
        }),
        createStringDateTokenConfiguration({
          name: "month",
          dictionary: [
            "Invalid",
            "Hammer",
            "Midwinter",
            "Alturiak",
            "Ches",
            "Tarsakh",
            "Greengrass",
            "Mirtul",
            "Kythorn",
            "Flamerule",
            "Midsummer",
            "Eleasis",
            "Elient",
            "Highharvesttide",
            "Marpenoth",
            "Uktar",
            "Feast of the Moon",
            "Nightal",
          ],
        }),
        createNumberDateTokenConfiguration({ name: "day" }),
        createNumberDateTokenConfiguration({ name: "hour" }),
        createNumberDateTokenConfiguration({ name: "minute" }),
      ],
    },
  });
