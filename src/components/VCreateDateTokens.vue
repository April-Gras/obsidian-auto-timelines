<script setup lang="ts">
import VButton from "./VButton.vue";
import VInput from "./VInput.vue";

const props = defineProps<{
	modelValue: string[];
}>();
const emit = defineEmits<{
	"update:modelValue": [tokens: string[]];
}>();

function handleAddAtEnd() {
	emit("update:modelValue", [...props.modelValue, ""]);
}

function handleRemoveAtIndex(index: number) {
	const output = [...props.modelValue];

	output.splice(index, 1);
	emit("update:modelValue", output);
}

function editTokenAtIndex(index: number, value: string) {
	const output = [...props.modelValue];

	output[index] = value;
	emit("update:modelValue", output);
}
</script>

<template>
	<div class="v-grid-display">
		<div v-for="(value, index) in modelValue" class="v-inline-flex-display">
			<VButton @click="handleRemoveAtIndex(index)">-</VButton>
			<VInput
				:value="value"
				:input-id="`create-date-token-${index}`"
				@update:value="editTokenAtIndex(index, $event)"
			/>
		</div>
		<VButton @click="handleAddAtEnd">{{ $t("common.add") }}</VButton>
	</div>
</template>
