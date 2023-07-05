<script setup lang="ts">
import VInput from "./VInput.vue";
import VButton from "./VButton.vue";
import { SETTINGS_DEFAULT } from "~/settings";

import type { AutoTimelineSettings } from "~/types";
import { createDefaultDateConfiguration } from "~/utils";
import VConfigureDateTokenArray from "./VConfigureDateTokenArray.vue";
import VHeader from "./VHeader.vue";

defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const targetKeys: Exclude<
	keyof AutoTimelineSettings,
	"dateTokenConfiguration" | "lookForTagsForTimeline"
>[] = ["dateParserRegex", "dateParserGroupPriority", "dateDisplayFormat"];

function handleResetToDefault(): void {
	emit("update:value", {
		...targetKeys.reduce((accumulator, key) => {
			accumulator[key] = SETTINGS_DEFAULT[key];
			return accumulator;
		}, {} as Partial<AutoTimelineSettings>),
		dateTokenConfiguration: [
			createDefaultDateConfiguration({ name: "year" }),
			createDefaultDateConfiguration({ name: "month" }),
			createDefaultDateConfiguration({ name: "day" }),
		],
	});
}
</script>
<template>
	<section class="v-grid-display">
		<VButton @click.native="handleResetToDefault">{{
			$t("settings.button.resetToDefault")
		}}</VButton>
		<VInput
			type="text"
			v-for="key in targetKeys"
			:value="value[key]"
			@update:value="emit('update:value', { [key]: $event })"
			:input-id="key"
		>
			<template #label>{{ $t(`settings.label.${key}`) }}</template>
			<template #description>{{
				$t(`settings.description.${key}`)
			}}</template>
		</VInput>
		<VHeader>{{
			$t("settings.title.advancedDateFormatsTokenConfiguration")
		}}</VHeader>
		<VConfigureDateTokenArray
			:model-value="value.dateTokenConfiguration"
			@update:model-value="
				emit('update:value', { dateTokenConfiguration: $event })
			"
		/>
	</section>
</template>
