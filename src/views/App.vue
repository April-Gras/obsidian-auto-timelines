<script setup lang="ts">
import { ref, computed } from "vue";
import VNav from "~/components/VNav.vue";
import VSettings from "./VSettings.vue";
import VDateFormats from "./VDateFormats.vue";

import type { NavigationTarget } from "~/components/VNav.vue";
import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Partial<AutoTimelineSettings>];
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
		<VNav v-model:model-value="currentRoute" />
		<Transition mode="out-in">
			<component
				:is="currentComponent"
				@update:model-value="emit('update:modelValue', $event)"
				:model-value="props.modelValue"
			></component>
		</Transition>
	</div>
</template>
