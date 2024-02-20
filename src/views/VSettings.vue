<script lang="ts" setup>
import { computed } from "vue";

import VHeader from "~/components/VHeader.vue";
import VInput from "~/components/VInput.vue";
import VCheckbox from "~/components/VCheckbox.vue";
import VToggleNumber from "~/components/VToggleNumber.vue";

import { SETTINGS_DEFAULT } from "~/settings";

import type { AutoTimelineSettings, PickByType } from "~/types";

const props = defineProps<{
	modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Partial<AutoTimelineSettings>];
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
	"inlineEventEndOfBodyMarker",
	"eventRenderToggleKey",
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
		(key) => props.modelValue[key] === fantasyCalendarPreset[key]
	);
});

function handleUpdateValueFantasyCalendarCheckbox() {
	if (keysAreCompliantWithFcPreset.value)
		emit(
			"update:modelValue",
			fantasyCalendarKeys.reduce((acc, key) => {
				acc[key] = SETTINGS_DEFAULT[key];
				return acc;
			}, {} as Partial<AutoTimelineSettings>)
		);
	else emit("update:modelValue", fantasyCalendarPreset);
}

const checkboxKeys: readonly (keyof PickByType<
	AutoTimelineSettings,
	boolean
>)[] = [
	"lookForInlineEventsInNotes",
	"lookForTagsForTimeline",
	"applyAdditonalConditionFormatting",
	"stylizeDateInline",
];

const fontSizeOverrides: readonly (keyof PickByType<
	AutoTimelineSettings,
	number
>)[] = ["bodyFontSize", "dateFontSize", "titleFontSize"];
</script>

<template>
	<div class="v-grid-display">
		<section class="v-grid-display">
			<VInput
				type="text"
				v-for="key in generalSettingKeys"
				:model-value="modelValue[key]"
				@update:model-value="
					emit('update:modelValue', { [key]: $event.trim() })
				"
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
				:model-value="modelValue[key]"
				:input-id="key"
				@update:model-value="
					emit('update:modelValue', { [key]: $event })
				"
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
				input-id="fantasy-calendar-preset-keys"
				:model-value="keysAreCompliantWithFcPreset"
				@update:model-value="handleUpdateValueFantasyCalendarCheckbox"
			>
				<template #label>{{
					$t("settings.label.fantasyCalendarPresetKeys")
				}}</template>
				<template #description>{{
					$t("settings.description.fantasyCalendarPresetKeys")
				}}</template>
			</VCheckbox>
			<VCheckbox
				input-id="fantasy-calendar-span-events"
				:model-value="modelValue.lookForCalendariumSpanEvents"
				@update:model-value="
					emit('update:modelValue', {
						lookForCalendariumSpanEvents: $event,
					})
				"
			>
				<template #label>
					<i18n-t
						keypath="settings.label.fantasyCalendarSpanEvents.text"
						scope="global"
					>
						<template #link>
							<b
								><a
									href="https://plugins.javalent.com/calendarium/events/automatic#Span+tag+event+creation"
									target="_blank"
								>
									{{
										$t(
											"settings.label.fantasyCalendarSpanEvents.link"
										)
									}}
								</a></b
							>
						</template>
					</i18n-t>
				</template>
				<template #description>{{
					$t("settings.description.fantasyCalendarSpanEvents")
				}}</template>
			</VCheckbox>
		</section>
		<hr />
		<section class="v-grid-display">
			<VHeader>{{ $t("settings.title.accessibility") }}</VHeader>
			<VToggleNumber
				v-for="key in fontSizeOverrides"
				:model-value="modelValue[key]"
				@update:model-value="
					emit('update:modelValue', { [key]: $event })
				"
				:input-id="key"
			>
				<template #checkbox-label>{{
					$t(`settings.label.${key}`)
				}}</template>
			</VToggleNumber>
		</section>
	</div>
</template>
