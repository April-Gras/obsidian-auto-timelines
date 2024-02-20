<script setup lang="ts">
import { ref, computed } from "vue";

import VAdvancedDateFormats from "~/components/VAdvancedDateFormats.vue";
import VCreateDateFormatFlow from "~/components/VCreateDateFormatFlow.vue";
import VHeader from "~/components/VHeader.vue";
import VIconButton from "~/components/VIconButton.vue";
import VSelectDateFormatPreset from "~/components/VSelectDateFormatPreset.vue";

import type { AutoTimelineSettings } from "~/types";
import type { Component } from "vue";

defineProps<{
	modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Partial<AutoTimelineSettings>];
}>();

type AvailableComponentName =
	| "VAdvancedDateFormats"
	| "VCreateDateFormatFlow"
	| "VSelectDateFormatPreset";

const selectedComponentName = ref<AvailableComponentName>(
	"VCreateDateFormatFlow"
);

const selectedComponent = computed<Component>(() => {
	switch (selectedComponentName.value) {
		case "VAdvancedDateFormats":
			return VAdvancedDateFormats;
		case "VCreateDateFormatFlow":
			return VCreateDateFormatFlow;
		case "VSelectDateFormatPreset":
			return VSelectDateFormatPreset;
	}
});
</script>

<template>
	<article class="v-grid-display">
		<VHeader>{{ $t("settings.title.date-formats") }}</VHeader>
		<Transition mode="out-in">
			<div class="v-inline-flex-display">
				<VIconButton
					@click="selectedComponentName = 'VCreateDateFormatFlow'"
					:has-accent="
						selectedComponentName === 'VCreateDateFormatFlow'
					"
					iconType="box"
				>
					<template #default>{{ $t('dateFormatsNav.wizzard') }}</template>
				</VIconButton>
				<VIconButton
					@click="selectedComponentName = 'VSelectDateFormatPreset'"
					:has-accent="
						selectedComponentName === 'VSelectDateFormatPreset'
					"
					iconType="arrow-down-circle"
				>
					<template #default>{{ $t("dateFormatsNav.presets") }}</template>
				</VIconButton>
				<VIconButton
					@click="selectedComponentName = 'VAdvancedDateFormats'"
					:has-accent="
						selectedComponentName === 'VAdvancedDateFormats'
					"
					iconType="settings"
				>
					<template #default>{{ $t("dateFormatsNav.advanced") }}</template>
				</VIconButton>
			</div>
		</Transition>
		<Transition mode="out-in">
			<KeepAlive>
				<component
					:is="selectedComponent"
					:model-value="modelValue"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</KeepAlive>
		</Transition>
	</article>
</template>
