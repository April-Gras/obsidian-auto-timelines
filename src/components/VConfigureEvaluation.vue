<script setup lang="ts">
import type { Evaluation } from "~/types";

import VSelect from "./VSelect.vue";
import VInput from "./VInput.vue";
import VButton from "./VButton.vue";

import { availableConditionArray } from "~/types";

defineProps<{
	modelValue: Evaluation;
	inputId: string | number;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Evaluation];
	delete: [];
}>();
</script>
<template>
	<div class="v-inline-flex-display">
		<VButton @click.native="emit('delete')">X</VButton>
		<div class="slim v-grid-display-2">
			<VSelect
				:options="availableConditionArray"
				:model-value="modelValue.condition"
				:input-id="`configure-single-date-token-format-condition-${inputId}`"
				translation-key="conditions"
				@update:value="
					emit('update:modelValue', {
						...modelValue,
						condition: $event,
					})
				"
			/>
			<VInput
				type="number"
				:value="modelValue.value"
				:input-id="`configure-single-date-token-format-value-${inputId}`"
				@update:value="
					emit('update:modelValue', { ...modelValue, value: $event })
				"
			/>
		</div>
	</div>
</template>
