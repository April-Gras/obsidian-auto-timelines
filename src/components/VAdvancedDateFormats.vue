<script setup lang="ts">
import VInput from "./VInput.vue";
import VButton from "./VButton.vue";
import { DEFAULT_METADATA_KEYS } from "~/settings";

import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const targetKeys: (keyof AutoTimelineSettings)[] = [
	"dateParserRegex",
	"dateParserGroupPriority",
	"dateDisplayFormat",
];

function handleResetToDefault(): void {
	emit(
		"update:value",
		targetKeys.reduce((accumulator, key) => {
			accumulator[key] = DEFAULT_METADATA_KEYS[key];
			return accumulator;
		}, {} as Partial<AutoTimelineSettings>)
	);
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
</template>
