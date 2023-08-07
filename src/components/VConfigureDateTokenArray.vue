<script setup lang="ts">
import VConfigureSingleDateToken from "./VConfigureSingleDateToken.vue";

import type { DateTokenConfiguration } from "~/types";

const props = withDefaults(
	defineProps<{
		modelValue: DateTokenConfiguration[];
		displayDeleteOption: boolean;
	}>(),
	{ displayDeleteOption: false }
);

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration[]];
}>();

function handleUpdateModelValueAtIndex(
	value: DateTokenConfiguration,
	index: number
) {
	const clone = [...props.modelValue];

	clone[index] = value;
	emit("update:modelValue", clone);
}

function handleDeleteModelValueAtIndex(index: number) {
	emit(
		"update:modelValue",
		props.modelValue.filter((_, i) => index !== i)
	);
}
</script>

<template>
	<section class="v-grid-display">
		<div v-for="(dateTokenConfiguration, index) in modelValue">
			<VConfigureSingleDateToken
				:model-value="dateTokenConfiguration"
				:allowDelete="displayDeleteOption"
				@update:model-value="
					handleUpdateModelValueAtIndex($event, index)
				"
				@delete="handleDeleteModelValueAtIndex(index)"
			/>
			<hr v-if="index < modelValue.length - 1" />
		</div>
	</section>
</template>
