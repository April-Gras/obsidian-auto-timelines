<script setup lang="ts">
import { ref } from "vue";

import VAdvancedDateFormats from "~/components/VAdvancedDateFormats.vue";
import VCreateDateFormatFlow from "~/components/VCreateDateFormatFlow.vue";
import VCheckbox from "~/components/VCheckbox.vue";
import VHeader from "~/components/VHeader.vue";

import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const useAdvancedMode = ref(false);
</script>

<template>
	<article class="v-grid-display">
		<VHeader>{{ $t("settings.title.date-formats") }}</VHeader>
		<VCheckbox v-model:value="useAdvancedMode" input-id="use-advanced-mode">
			<template #label>{{
				$t("settings.label.useAdvancedMode")
			}}</template>
		</VCheckbox>
		<Transition mode="out-in">
			<KeepAlive>
				<VAdvancedDateFormats
					:value="value"
					@update:value="emit('update:value', $event)"
					v-if="useAdvancedMode"
				/>
				<VCreateDateFormatFlow
					v-else
					:value="value"
					@update:value="emit('update:value', $event)"
				/>
			</KeepAlive>
		</Transition>
	</article>
</template>
