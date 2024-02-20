import { dndCalendarOfHarptosDalereckoningDatePreset } from "./dndCalendarOfHarptosDalereckoning";
import { imperialDatePreset } from "./imperial";
import { normalDatePreset } from "./normal";
import { verboseDayDatePreset } from "./verboseDay";

export { dndCalendarOfHarptosDalereckoningDatePreset } from "./dndCalendarOfHarptosDalereckoning";
export { verboseDayDatePreset } from "./verboseDay";
export { imperialDatePreset } from "./imperial";
export { normalDatePreset } from "./normal";

export const allFormats = [
	normalDatePreset,
	imperialDatePreset,
	verboseDayDatePreset,
	dndCalendarOfHarptosDalereckoningDatePreset,
] as const;
