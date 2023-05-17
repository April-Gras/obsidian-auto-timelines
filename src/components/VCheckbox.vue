<script setup lang="ts">
const props = defineProps<{
	value: boolean;
	inputId: string;
}>();

const emit = defineEmits<{
	(e: "update:value", payload: boolean): void;
}>();

function handleInputEvent() {
	emit("update:value", !props.value);
}
</script>

<template>
	<div class="v-input-wrap v-checkbox">
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

		<div
			class="checkbox-container"
			@click="handleInputEvent"
			:class="{ 'is-enabled': value }"
		>
			<input :id="inputId" :value="value" type="checkbox" />
		</div>
	</div>
</template>
