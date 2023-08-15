<script setup lang="ts">
import { ref } from "vue";
import { Collapse } from "vue-collapsed";

defineSlots<{
	summary(props: {}): any;
	details(props: {}): any;
}>();
const props = withDefaults(
	defineProps<{
		startOpened?: boolean;
	}>(),
	{ startOpened: false }
);
const isOpen = ref(props.startOpened);
</script>

<template>
	<div role="article" class="v-details" :class="{ isOpen }">
		<div role="heading" aria-level="2" @click="isOpen = !isOpen">
			<span role="icon">▸</span>
			<span>
				<slot name="summary" />
			</span>
		</div>
		<Collapse :when="isOpen">
			<div style="padding-top: 8px">
				<slot name="details" />
			</div>
		</Collapse>
	</div>
</template>

<style scoped lang="scss">
.v-details {
	> div[role="heading"] {
		display: flex;
		gap: 4px;
	}
}

span[role="icon"] {
	transition: transform 150ms ease-in-out;
}

.isOpen {
	span[role="icon"] {
		transform: rotate(90deg);
	}
}
</style>
