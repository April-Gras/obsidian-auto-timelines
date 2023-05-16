<script setup lang="ts">
import { ref, computed } from "vue";
import VNav from "~/components/VNav.vue";
import VSettings from "./VSettings.vue";
import VDateFormats from "./VDateFormats.vue";

import type { NavigationTarget } from "~/components/VNav.vue";
import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	(e: "update:value", payload: Partial<AutoTimelineSettings>): void;
}>();

const currentRoute = ref("index" as NavigationTarget);
const currentComponent = computed(() => {
	switch (currentRoute.value) {
		case "index":
			return VSettings;
		case "date-formats":
			return VDateFormats;
	}
});
</script>

<template>
	<div>
		<VNav v-model:value="currentRoute" />
		<Transition mode="out-in">
			<component
				:is="currentComponent"
				@update:value="emit('update:value', $event)"
				:value="props.value"
			></component>
		</Transition>
	</div>
</template>
