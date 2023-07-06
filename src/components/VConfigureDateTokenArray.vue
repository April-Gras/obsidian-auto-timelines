<script setup lang="ts">
import VConfigureSingleDateToken from "./VConfigureSingleDateToken.vue";

import type { DateTokenConfiguration } from "~/types";

const { modelValue } = defineProps<{
	modelValue: DateTokenConfiguration[];
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration[]];
}>();

function handleUpdateModelValue(value: DateTokenConfiguration, index: number) {
	const clone = [...modelValue];

	clone[index] = value;
	emit("update:modelValue", clone);
}
</script>

<template>
	<section class="v-grid-display">
		<div v-for="(dateTokenConfiguration, index) in modelValue">
			<VConfigureSingleDateToken
				:model-value="dateTokenConfiguration"
				@update:model-value="handleUpdateModelValue($event, index)"
			/>
			<hr v-if="index < modelValue.length - 1" />
		</div>
	</section>
</template>
