<script setup lang="ts">
import VButton from "./VButton.vue";
import VInput from "./VInput.vue";

import { DateTokenType } from "~/types";

import type { DateTokenConfiguration } from "~/types";

const props = defineProps<{
	modelValue: DateTokenConfiguration[];
}>();
const emit = defineEmits<{
	"update:modelValue": [tokens: DateTokenConfiguration[]];
}>();

function handleAddAtEnd() {
	if (!props.modelValue.length) return;
	emit("update:modelValue", [
		...props.modelValue,
		{
			type: DateTokenType.number,
			minLeght: 2,
			name: "",
		} as DateTokenConfiguration,
	]);
}

function handleRemoveAtIndex(index: number) {
	const output = [...props.modelValue];

	output.splice(index, 1);
	emit("update:modelValue", output);
}

function editTokenAtIndex(index: number, value: string) {
	const output = [...props.modelValue];

	output[index].name = value.trim();
	emit("update:modelValue", output);
}
</script>

<template>
	<div class="v-grid-display">
		<p>{{ $t("settings.details.createDateToken") }}</p>
		<div v-for="(token, index) in modelValue" class="v-inline-flex-display">
			<VButton @click="handleRemoveAtIndex(index)">-</VButton>
			<VInput
				type="text"
				:model-value="token.name"
				:input-id="`create-date-token-${index}`"
				@update:model-value="editTokenAtIndex(index, $event)"
			/>
		</div>
		<VButton @click="handleAddAtEnd">{{ $t("common.add") }}</VButton>
	</div>
</template>
