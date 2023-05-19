<script setup lang="ts" generic="T extends 'text' | 'number'">
import { computed } from "vue";

type V = T extends "number" ? number : string;

const props = defineProps<{
	value: V;
	inputId: string;
	type: T;
}>();

const emit = defineEmits<{
	(e: "update:value", payload: V): void;
}>();

function handleInputEvent(event: Event) {
	if (!event.target) return;
	switch (props.type) {
		case "number":
			return emit(
				"update:value",
				// @ts-expect-error
				Number((event.target as HTMLInputElement).value)
			);
		case "text":
			return emit(
				"update:value",
				// @ts-expect-error
				(event.target as HTMLInputElement).value
			);
	}
}

const typedType = computed(() => props.type.toString());
</script>

<template>
	<div class="v-input-wrap">
		<div v-if="$slots['label'] || $slots['description']">
			<label
				:for="inputId"
				v-if="$slots['label']"
				class="setting-item-name"
			>
				<slot name="label" />
			</label>
			<summary
				class="setting-item-description"
				v-if="$slots['description']"
			>
				<slot name="description" />
			</summary>
		</div>

		<input
			:id="inputId"
			:value="value"
			:type="typedType"
			@input="handleInputEvent"
		/>
	</div>
</template>
