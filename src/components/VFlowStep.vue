<script setup lang="ts">
const emit = defineEmits<{
	next: [void];
	previous: [void];
}>();
</script>

<template>
	<div class="v-grid-diplay">
		<slot />
	</div>
</template>
