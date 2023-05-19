<script setup lang="ts">
import { ref } from "vue";

import VButton from "./VButton.vue";
import VCreateDateTokens from "./VCreateDateTokens.vue";
import VCreateInputFormat from "./VCreateInputFormat.vue";
import VCreateOutputFormat from "./VCreateOutputFormat.vue";
import VDateFormatCreationConfirmation from "./VDateFormatCreationConfirmation.vue";

import type { AutoTimelineSettings } from "~/types";

defineProps<{
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
	"final",
}
const flowProgress = ref(FlowState["not-started"] as FlowState);

const tokens = ref(["year", "month", "day"] as string[]);
const inputRegex = ref("");
const outputFormat = ref("");

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
			return (flowProgress.value = FlowState["final"]);
		default:
			return (flowProgress.value = FlowState["not-started"]);
	}
}

function handleSave() {
	emit("update:value", {
		dateDisplayFormat: outputFormat.value,
		dateParserGroupPriority: tokens.value.join(","),
		dateParserRegex: inputRegex.value,
	});
	flowProgress.value = FlowState["not-started"];
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
				scope="global"
			>
				<template v-for="(propValue, key) in value" #[key]>
					<b>{{ propValue }}</b>
				</template>
			</i18n-t>
			<VButton
				@click="flowProgress = FlowState['token-creation']"
				has-accent
			>
				{{ $t("common.start") }}
			</VButton>
		</section>
		<section
			class="v-grid-display"
			v-else-if="flowProgress !== FlowState['final']"
		>
			<Transition mode="out-in">
				<KeepAlive>
					<VCreateDateTokens
						v-if="flowProgress === FlowState['token-creation']"
						v-model="tokens"
					/>
					<VCreateInputFormat
						v-model:value="inputRegex"
						:tokens="tokens"
						v-else-if="flowProgress === FlowState['input-format']"
					/>
					<VCreateOutputFormat
						v-model:value="outputFormat"
						:tokens="tokens"
						v-else-if="flowProgress === FlowState['output-format']"
					/>
				</KeepAlive>
			</Transition>
			<div class="v-grid-display-2">
				<VButton @click="handlePreviousClick">
					{{ $t("common.previous") }}
				</VButton>
				<VButton @click="handleNextClick" has-accent>
					{{ $t("common.next") }}
				</VButton>
			</div>
		</section>
		<section v-else>
			<VDateFormatCreationConfirmation
				:tokens="tokens"
				:input-regex="inputRegex"
				:output-format="outputFormat"
				@save="handleSave"
			/>
		</section>
	</Transition>
</template>
