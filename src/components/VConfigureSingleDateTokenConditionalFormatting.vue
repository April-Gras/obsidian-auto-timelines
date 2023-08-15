<script setup lang="ts">
import type { DateTokenConfiguration } from "~/types";

import VSelect from "./VSelect.vue";
import VInput from "./VInput.vue";

const props = withDefaults(
	defineProps<{
		modelValue: DateTokenConfiguration;
		allowDelete: boolean;
	}>(),
	{
		allowDelete: false,
	}
);

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
}>();
</script>
<template>
	<div class="v-grid-display slim"></div>
</template>
