<script lang="ts" setup>
import { computed } from "vue";

import VHeader from "~/components/VHeader.vue";
import VInput from "~/components/VInput.vue";
import VCheckbox from "~/components/VCheckbox.vue";

import { SETTINGS_DEFAULT } from "~/settings";

import type { AutoTimelineSettings, PickByType } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const generalSettingKeys = [
	"metadataKeyEventStartDate",
	"metadataKeyEventEndDate",
	"metadataKeyEventTitleOverride",
	"metadataKeyEventBodyOverride",
	"metadataKeyEventPictureOverride",
	"metadataKeyEventTimelineTag",
	"markdownBlockTagsToFindSeparator",
	"noteInlineEventKey",
] satisfies (keyof PickByType<AutoTimelineSettings, string>)[];

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
				acc[key] = SETTINGS_DEFAULT[key];
				return acc;
			}, {} as Partial<AutoTimelineSettings>)
		);
	else emit("update:value", fantasyCalendarPreset);
};

const checkboxKeys: readonly (keyof PickByType<
	AutoTimelineSettings,
	boolean
>)[] = [
	"lookForInlineEventsInNotes",
	"lookForTagsForTimeline",
	"applyAdditonalConditionFormatting",
];
</script>

<template>
	<div class="v-grid-display">
		<section class="v-grid-display">
			<VInput
				type="text"
				v-for="key in generalSettingKeys"
				:value="value[key]"
				@update:value="emit('update:value', { [key]: $event.trim() })"
				:input-id="key"
			>
				<template #label>{{ $t(`settings.label.${key}`) }}</template>
				<template #description>{{
					$t(`settings.description.${key}`)
				}}</template>
			</VInput>
		</section>
		<hr />
		<section class="v-grid-display slim" v-for="key in checkboxKeys">
			<VHeader>{{ $t(`settings.title.${key}`) }}</VHeader>
			<VCheckbox
				:value="value[key]"
				:input-id="key"
				@update:value="emit('update:value', { [key]: $event })"
			>
				<template #label>{{ $t(`settings.label.${key}`) }}</template>
				<template #description>
					<i18n-t
						scope="global"
						:keypath="`settings.description.${key}`"
					>
						<template
							#linkText
							v-if="
								$te(`settings.linkValue.${key}`) &&
								$te(`settings.linkText.${key}`)
							"
						>
							<a :href="$t(`settings.linkValue.${key}`)">{{
								$t(`settings.linkText.${key}`)
							}}</a>
						</template>
					</i18n-t>
				</template>
			</VCheckbox>
		</section>
		<hr />
		<section class="v-grid-display slim">
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
	</div>
</template>
