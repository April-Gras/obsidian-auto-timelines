<script setup lang="ts">
import { ref } from "vue";

import VCheckbox from "./VCheckbox.vue";
import VInput from "./VInput.vue";
import VDetails from "./VDetails.vue";

const props = defineProps<{
	inputId: string;
	modelValue: number;
}>();

defineSlots<{
	["checkbox-description"](props: {}): any;
	["checkbox-label"](props: {}): any;
	["input-description"](props: {}): any;
	["input-label"](props: {}): any;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: number];
}>();

const optInNumber = ref(props.modelValue >= 0);

function handleOptInNumberUpdate(value: boolean) {
	if (value) emit("update:modelValue", 16);
	else emit("update:modelValue", -1);

	optInNumber.value = value;
}
</script>
<template>
	<VDetails :override-open="optInNumber">
		<template #summary>
			<VCheckbox
				:model-value="optInNumber"
				:input-id="`${inputId}-checkbox`"
				@update:model-value="handleOptInNumberUpdate"
			>
				<template #description
					><slot name="checkbox-description"
				/></template>
				<template #label><slot name="checkbox-label" /></template>
			</VCheckbox>
		</template>
		<template #details>
			<VInput
				:model-value="modelValue"
				type="number"
				:min="0"
				@update:model-value="emit('update:modelValue', $event)"
				:input-id="`${inputId}-number-input`"
			>
				<template #description
					><slot name="input-description"
				/></template>
				<template #label><slot name="input-label" /></template>
			</VInput>
		</template>
	</VDetails>
</template>
