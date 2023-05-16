<script setup lang="ts">
import VHeader from "~/components/VHeader.vue";

import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();
</script>

<template>
	<section class="v-grid-display">
		<VHeader>{{ $t("") }}</VHeader>
	</section>
</template>
