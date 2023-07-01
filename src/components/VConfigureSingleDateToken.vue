<script setup lang="ts">
import { availableDateTokenTypeArray } from "~/types";

import VSelect from "~/components/VSelect.vue";

import type { DateTokenConfiguration } from "~/types";

const { configuration } = defineProps<{
	configuration: DateTokenConfiguration;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
}>();
</script>

<template>
	<div class="v-grid-display-2">
		<VSelect
			:model-value="configuration.type"
			:input-id="`configure-date-token-${configuration.name}`"
			:options="availableDateTokenTypeArray"
			translation-key="dateTokens.configure"
		></VSelect>
	</div>
</template>
