<script setup lang="ts">
defineProps({
	hasAccent: {
		type: Boolean,
		required: true,
		default: false,
	},
});
</script>
<template>
	<button :class="{ 'mod-cta': hasAccent }"><slot /></button>
</template>
