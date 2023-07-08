<script setup lang="ts">
import { ref } from "vue";

import VButton from "./VButton.vue";
import VCreateDateTokens from "./VCreateDateTokens.vue";
import VCreateInputFormat from "./VCreateInputFormat.vue";
import VCreateOutputFormat from "./VCreateOutputFormat.vue";
import VDateFormatCreationConfirmation from "./VDateFormatCreationConfirmation.vue";

import type { AutoTimelineSettings, DateTokenConfiguration } from "~/types";
import { createNumberDateTokenConfiguration } from "~/utils";
import VConfigureDateTokenArray from "./VConfigureDateTokenArray.vue";

defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

enum FlowState {
	"not-started",
	"token-creation",
	"token-configuration",
	"input-format",
	"output-format",
	"final",
}
const flowProgress = ref(FlowState["not-started"] as FlowState);

const tokenConfigurations = ref([
	createNumberDateTokenConfiguration({ name: "year" }),
	createNumberDateTokenConfiguration({ name: "month" }),
	createNumberDateTokenConfiguration({ name: "day" }),
] as DateTokenConfiguration[]);
const inputRegex = ref("");
const outputFormat = ref("");

function handlePreviousClick() {
	switch (flowProgress.value) {
		case FlowState["token-creation"]:
			return (flowProgress.value = FlowState["not-started"]);
		case FlowState["token-configuration"]:
			return (flowProgress.value = FlowState["token-creation"]);
		case FlowState["input-format"]:
			return (flowProgress.value = FlowState["token-configuration"]);
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
			return (flowProgress.value = FlowState["token-configuration"]);
		case FlowState["token-configuration"]:
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
		dateParserGroupPriority: tokenConfigurations.value
			.map(({ name }) => name)
			.join(","),
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
				<VCreateDateTokens
					v-if="flowProgress === FlowState['token-creation']"
					v-model="tokenConfigurations"
				/>
				<VConfigureDateTokenArray
					v-model="tokenConfigurations"
					v-else-if="flowProgress == FlowState['token-configuration']"
				/>
				<VCreateInputFormat
					v-model:value="inputRegex"
					:token-configurations="tokenConfigurations"
					v-else-if="flowProgress === FlowState['input-format']"
				/>
				<VCreateOutputFormat
					v-model:value="outputFormat"
					:token-configurations="tokenConfigurations"
					v-else-if="flowProgress === FlowState['output-format']"
				/>
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
				:token-configurations="tokenConfigurations"
				:input-regex="inputRegex"
				:output-format="outputFormat"
				@save="handleSave"
			/>
		</section>
	</Transition>
</template>
