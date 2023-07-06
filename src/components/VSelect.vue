<script setup lang="ts" generic="T extends string">
import VLabel from "~/components/VLabel.vue";

const props = defineProps<{
	options: T[];
	modelValue: T;
	inputId: string;
	translationKey: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: T];
}>();

defineSlots<{
	label(props: {}): any;
	description(props: {}): any;
}>();

function handleSelectInput({ target }: Event) {
	if (!target) return;
	const value = (target as HTMLInputElement).value;

	return emit("update:modelValue", value as T);
}
</script>

<template>
	<div role="select" class="v-input-wrap">
		<VLabel :input-id="inputId">
			<template #label><slot name="label" /></template>
			<template #description><slot name="description" /></template>
		</VLabel>
		<select :value="modelValue" @input="handleSelectInput">
			<option v-for="option in options" :value="option">
				{{ $t(`${translationKey}.${option}`) }}
			</option>
		</select>
	</div>
</template>
