<script setup lang="ts">
defineSlots<{
	title(props: {}): any;
	text(props: {}): any;
}>();
</script>

<template>
	<figure class="warning v-warning-block v-grid-display">
		<figcaption>
			<slot name="title" />
		</figcaption>
		<div>
			<slot name="text" />
		</div>
	</figure>
</template>
