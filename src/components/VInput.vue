<script setup lang="ts">
defineProps<{
	value: string;
	inputId: string;
}>();

const emit = defineEmits<{
	(e: "update:value", payload: string): void;
}>();

function handleInputEvent(event: Event) {
	if (!event.target) return;
	emit("update:value", (event.target as HTMLInputElement).value);
}
</script>

<template>
	<div class="v-input-wrap">
		<div>
			<label
				:for="inputId"
				v-if="$slots['label']"
				class="setting-item-name"
			>
				<slot name="label" />
			</label>
			<summary class="setting-item-description">
				<slot name="description" />
			</summary>
		</div>

		<input
			:id="inputId"
			:value="value"
			type="text"
			@input="handleInputEvent"
		/>
	</div>
</template>
