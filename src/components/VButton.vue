<script setup lang="ts">
defineProps({
	hasAccent: {
		type: Boolean,
		required: false,
		default: false,
	},
	disabled: {
		type: Boolean,
		required: false,
		default: false,
	},
});
</script>
<template>
	<button :disabled="disabled" :class="{ 'mod-cta': hasAccent }">
		<slot v-if="!!$slots.default" />
	</button>
</template>
