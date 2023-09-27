<script setup lang="ts">
import { computed, ref } from "vue";
import { Collapse } from "vue-collapsed";
import { isDefined } from "~/utils";

defineSlots<{
	summary(props: {}): any;
	details(props: {}): any;
}>();
const props = withDefaults(
	defineProps<{
		startOpened?: boolean;
		overrideOpen?: boolean;
	}>(),
	{ startOpened: false, overrideOpen: undefined }
);
const localIsOpen = ref(props.startOpened);

const isOpen = computed(() =>
	isDefined(props.overrideOpen) ? props.overrideOpen : localIsOpen.value
);
</script>

<template>
	<div role="article" class="v-details" :class="{ isOpen }">
		<div
			class="heading"
			role="heading"
			aria-level="2"
			@click="localIsOpen = !localIsOpen"
		>
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
		gap: 8px;
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
