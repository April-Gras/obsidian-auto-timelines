<script setup lang="ts">
import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	(e: "update:value", payload: Partial<AutoTimelineSettings>): void;
}>();
</script>

<template>
	<div>hehe</div>
</template>
