<script setup lang="ts">
import { ref } from "vue";

import VAdvancedDateFormats from "~/components/VAdvancedDateFormats.vue";
import VCreateDateFormatFlow from "~/components/VCreateDateFormatFlow.vue";
import VCheckbox from "~/components/VCheckbox.vue";
import VHeader from "~/components/VHeader.vue";

import type { AutoTimelineSettings } from "~/types";

defineProps<{
	modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Partial<AutoTimelineSettings>];
}>();

const useAdvancedMode = ref(false);
</script>

<template>
	<article class="v-grid-display">
		<VHeader>{{ $t("settings.title.date-formats") }}</VHeader>
		<VCheckbox
			v-model:model-value="useAdvancedMode"
			input-id="use-advanced-mode"
		>
			<template #label>{{
				$t("settings.label.useAdvancedMode")
			}}</template>
		</VCheckbox>
		<Transition mode="out-in">
			<KeepAlive>
				<VAdvancedDateFormats
					:model-value="value"
					@update:model-value="emit('update:modelValue', $event)"
					v-if="useAdvancedMode"
				/>
				<VCreateDateFormatFlow
					v-else
					:model-value="value"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</KeepAlive>
		</Transition>
	</article>
</template>
