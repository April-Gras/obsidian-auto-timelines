<script lang="ts" setup>
defineSlots<{
	default(props: {}): any;
}>();

withDefaults(defineProps<{ slim?: boolean; clickable?: false }>(), {
	slim: false,
	clickable: false,
});
</script>

<template>
	<article class="v-card" :class="{ slim, clickable }">
		<slot />
	</article>
</template>

<style scoped lang="scss">
.v-card {
	transition: box-shadow 150ms ease-in-out;
	box-shadow: var(--input-shadow);
	background-color: var(--background-secondary);
	padding: 16px;
	border-radius: 4px;

	&:hover {
		box-shadow: var(--input-shadow-hover);
	}

	&.slim {
		padding: 8px;
	}

	&.clickable {
		cursor: pointer;
	}
}
</style>
