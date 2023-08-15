<script setup lang="ts">
import VButton from "./VButton.vue";
import VConfigureSingleDateTokenConditionalFormatting from "./VConfigureSingleDateTokenConditionalFormatting.vue";
import VConfigureSingleDateTokenType from "./VConfigureSingleDateTokenType.vue";
import VDetails from "./VDetails.vue";
import VHeader from "./VHeader.vue";

import type { DateTokenConfiguration } from "~/types";

const props = withDefaults(
	defineProps<{
		modelValue: DateTokenConfiguration;
		allowDelete: boolean;
	}>(),
	{
		allowDelete: false,
	}
);

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
	delete: [];
}>();
</script>

<template>
	<div class="v-grid-display">
		<VButton @click="$emit('delete')">{{ $t("common.remove") }}</VButton>
		<VHeader>{{ modelValue.name }}</VHeader>
		<VDetails>
			<template #summary>{{
				$t("settings.label.configureSingleDateToken.type")
			}}</template>
			<template #details>
				<VConfigureSingleDateTokenType
					v-bind="props"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</template>
		</VDetails>
		<VDetails>
			<template #summary>{{
				$t(
					"settings.label.configureSingleDateToken.conditionalFormatting"
				)
			}}</template>
			<template #details>
				<VConfigureSingleDateTokenConditionalFormatting
					v-bind="props"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</template>
		</VDetails>
	</div>
</template>
