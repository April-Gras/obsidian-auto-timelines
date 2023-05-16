<script lang="ts" setup>
import { computed, ref } from "vue";

import VHeader from "~/components/VHeader.vue";
import VInput from "~/components/VInput.vue";
import VCheckbox from "~/components/VCheckbox.vue";

import { DEFAULT_METADATA_KEYS } from "~/settings";

import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const generalSettingKeys = Object.keys(DEFAULT_METADATA_KEYS).filter((e) =>
	e.startsWith("metadataKey")
) as (keyof AutoTimelineSettings)[];

const fantasyCalendarPreset: Record<
	Extract<
		keyof AutoTimelineSettings,
		| "metadataKeyEventStartDate"
		| "metadataKeyEventEndDate"
		| "metadataKeyEventTitleOverride"
	>,
	string
> = {
	metadataKeyEventEndDate: "fc-end",
	metadataKeyEventStartDate: "fc-date",
	metadataKeyEventTitleOverride: "fc-display-name",
};
const fantasyCalendarKeys = Object.keys(
	fantasyCalendarPreset
) as (keyof typeof fantasyCalendarPreset)[];

const keysAreCompliantWithFcPreset = computed(() => {
	return fantasyCalendarKeys.every(
		(key) => props.value[key] === fantasyCalendarPreset[key]
	);
});

const handleUpdateValueFantasyCalendarCheckbox = () => {
	if (keysAreCompliantWithFcPreset.value)
		emit(
			"update:value",
			fantasyCalendarKeys.reduce((acc, key) => {
				acc[key] = DEFAULT_METADATA_KEYS[key];
				return acc;
			}, {} as Partial<AutoTimelineSettings>)
		);
	else emit("update:value", fantasyCalendarPreset);
};
</script>

<template>
	<div class="v-grid-display">
		<section class="v-grid-display">
			<VHeader>{{ $t("settings.title.generic-settings") }}</VHeader>
			<VInput
				v-for="key in generalSettingKeys"
				:value="props.value[key]"
				@update:value="emit('update:value', { [key]: $event })"
				:input-id="key"
			>
				<template #label>{{ $t(`settings.label.${key}`) }}</template>
				<template #description>{{
					$t(`settings.description.${key}`)
				}}</template>
			</VInput>
		</section>
		<hr />
		<section class="v-grid-display">
			<VHeader>
				<i18n-t keypath="settings.title.slot-presets" scope="global">
					<template #slot>
						<a
							href="https://github.com/fantasycalendar/obsidian-fantasy-calendar"
							>Fantasy Calendar</a
						>
					</template>
				</i18n-t>
			</VHeader>
			<VCheckbox
				input-id="fantasy-calendar-checkbox"
				:value="keysAreCompliantWithFcPreset"
				@update:value="handleUpdateValueFantasyCalendarCheckbox"
			>
				<template #label>{{
					$t("settings.label.fantasyCalendarCheckbox")
				}}</template>
				<template #description>{{
					$t("settings.description.fantasyCalendarCheckbox")
				}}</template>
			</VCheckbox>
		</section>
		<hr />
		<section class="v-grid-display">
			<VHeader>{{ $t("settings.title.date-formats") }}</VHeader>
		</section>
	</div>
</template>
