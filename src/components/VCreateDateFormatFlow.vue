<script setup lang="ts">
import { ref } from "vue";

import VCreateDateTokens from "./VCreateDateTokens.vue";
import VButton from "./VButton.vue";

import type { AutoTimelineSettings } from "~/types";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

enum FlowState {
	"not-started",
	"token-creation",
	"input-format",
	"output-format",
}
const flowProgress = ref(FlowState["not-started"] as FlowState);

const tokens = ref(["year", "month", "day"] as string[]);

function handlePreviousClick() {
	switch (flowProgress.value) {
		case FlowState["token-creation"]:
			return (flowProgress.value = FlowState["not-started"]);
		case FlowState["input-format"]:
			return (flowProgress.value = FlowState["token-creation"]);
		case FlowState["output-format"]:
			return (flowProgress.value = FlowState["input-format"]);
		default:
			return (flowProgress.value = FlowState["not-started"]);
	}
}

function handleNextClick() {
	switch (flowProgress.value) {
		case FlowState["not-started"]:
			return (flowProgress.value = FlowState["token-creation"]);
		case FlowState["token-creation"]:
			return (flowProgress.value = FlowState["input-format"]);
		case FlowState["input-format"]:
			return (flowProgress.value = FlowState["output-format"]);
		case FlowState["output-format"]:
			return (flowProgress.value = FlowState["not-started"]);
		default:
			return (flowProgress.value = FlowState["not-started"]);
	}
}
</script>

<template>
	<Transition mode="out-in">
		<section
			class="v-grid-display"
			v-if="flowProgress === FlowState['not-started']"
		>
			<i18n-t
				keypath="settings.description.dateFormatFlowOnboarding"
				tag="div"
			>
				<template v-for="(propValue, key) in value" #[key]>
					<b>{{ propValue }}</b>
				</template>
			</i18n-t>
			<VButton
				@click="flowProgress = FlowState['token-creation']"
				has-accent
				>{{ $t("common.start") }}</VButton
			>
		</section>
		<section class="v-grid-display" v-else>
			<Transition mode="out-in">
				<VCreateDateTokens
					v-if="flowProgress === FlowState['token-creation']"
					v-model="tokens"
				/>
			</Transition>
			<div class="v-grid-display-2">
				<VButton @click="handlePreviousClick">{{
					$t("common.previous")
				}}</VButton>
				<VButton @click="handleNextClick" has-accent>{{
					$t("common.next")
				}}</VButton>
			</div>
		</section>
	</Transition>
</template>
