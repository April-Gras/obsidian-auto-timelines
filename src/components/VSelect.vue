<script
	setup
	lang="ts"
	generic="T extends string | number | { _vSelectKey: string | number }"
>
import VLabel from "~/components/VLabel.vue";

const { options } = defineProps<{
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
</script>

<template>
	<div role="select">
		<VLabel :input-id="inputId">
			<template #label><slot name="label" /></template>
			<template #description><slot name="description" /></template>
		</VLabel>
		<select
			:value="modelValue"
			@input="emit('update:modelValue', $event.target.value)"
		>
			<options v-for="option in options" :value="option">{{
				$t(`${translationKey}.${option}`)
			}}</options>
		</select>
	</div>
</template>
