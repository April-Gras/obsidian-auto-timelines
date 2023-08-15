<script setup lang="ts">
import { computed } from "vue";

import cloneDeep from "lodash.clonedeep";

import VButton from "./VButton.vue";
import VCard from "./VCard.vue";
import VInput from "./VInput.vue";
import VHeader from "./VHeader.vue";
import VConfigureEvaluation from "./VConfigureEvaluation.vue";

import {
	Condition,
	type AdditionalDateFormatting,
	type DateTokenConfiguration,
	type Evaluation,
} from "~/types";
import VCheckbox from "./VCheckbox.vue";

const props = defineProps<{
	modelValue: DateTokenConfiguration;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
}>();

function addFormatting() {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting.push({
		evaluations: [],
		conditionsAreExclusive: false,
		format: "sample {value} more sample",
	} satisfies AdditionalDateFormatting);

	emit("update:modelValue", clonedModelValue);
}

function editFormattingAtIndex(
	index: number,
	edits: Partial<AdditionalDateFormatting>
) {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting.splice(index, 1, {
		...clonedModelValue.formatting[index],
		...edits,
	});

	emit("update:modelValue", clonedModelValue);
}

function removeFormattingAtIndex(index: number) {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting.splice(index, 1);
	emit("update:modelValue", clonedModelValue);
}

function addEvaluationToFormatAtIndex(index: number) {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting[index].evaluations.push({
		condition: Condition.Equal,
		value: 0,
	});
	emit("update:modelValue", clonedModelValue);
}

function editEvaluationAtIndexFromFormatAtIndex(
	formatIndex: number,
	evaluationIndex: number,
	evaluation: Partial<Evaluation>
) {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting[formatIndex].evaluations[evaluationIndex] = {
		...clonedModelValue.formatting[formatIndex].evaluations[
			evaluationIndex
		],
		...evaluation,
	};
	emit("update:modelValue", clonedModelValue);
}

function removeEvaluationAtIndexFromFormatAtIndex(
	formatIndex: number,
	evaluationIndex: number
) {
	const clonedModelValue = cloneDeep(props.modelValue);

	clonedModelValue.formatting[formatIndex].evaluations.splice(
		evaluationIndex,
		1
	);
	emit("update:modelValue", clonedModelValue);
}

const moreThanOneEntry = computed(() => props.modelValue.formatting.length > 1);
</script>
<template>
	<div class="v-grid-display">
		<VButton @click.native="addFormatting">{{ $t("common.add") }}</VButton>
		<VCard
			v-for="(
				{ format, conditionsAreExclusive, evaluations }, index
			) in modelValue.formatting"
		>
			<div class="v-grid-display">
				<div class="v-inline-flex-display">
					<VButton
						@click.native="removeFormattingAtIndex(index)"
						v-if="moreThanOneEntry"
						>X</VButton
					>
					<VHeader>{{
						$tc("common.formatCount", index + 1)
					}}</VHeader>
				</div>
				<div class="v-grid-display slim">
					<VCheckbox
						:input-id="`configure-single-date-token-format-condition-are-exclusive-${index}`"
						:value="conditionsAreExclusive"
						@update:value="
							editFormattingAtIndex(index, {
								conditionsAreExclusive: $event,
							})
						"
					>
						<template #label>{{
							$t(
								"settings.label.configureSingleDateTokenConditionalFormatting.conditionsAreExclusive"
							)
						}}</template>
						<template #description>{{
							$t(
								"settings.description.configureSingleDateTokenConditionalFormatting.conditionsAreExclusive"
							)
						}}</template>
					</VCheckbox>
					<VInput
						:input-id="`configure-single-date-token-format-condition-are-exclusive-${index}`"
						:value="format"
						type="text"
						@update:value="
							editFormattingAtIndex(index, {
								format: $event,
							})
						"
					>
						<template #label>{{
							$t(
								"settings.label.configureSingleDateTokenConditionalFormatting.format"
							)
						}}</template>
						<template #description>{{
							$t(
								"settings.description.configureSingleDateTokenConditionalFormatting.format",
								// This is ridiculous but didn't find any way to escape the {value} without vue-i18n spawning an error.
								{ value: "{value}" }
							)
						}}</template>
					</VInput>
					<hr />
					<VButton
						has-accent
						@click.native="addEvaluationToFormatAtIndex(index)"
					>
						{{ $t("settings.button.addACondition") }}
					</VButton>
					<VConfigureEvaluation
						v-for="(evaluation, evaluationIndex) in evaluations"
						:model-value="evaluation"
						:input-id="`${index}-${evaluationIndex}`"
						@delete="
							removeEvaluationAtIndexFromFormatAtIndex(
								index,
								evaluationIndex
							)
						"
						@update:modelValue="
							editEvaluationAtIndexFromFormatAtIndex(
								index,
								evaluationIndex,
								$event
							)
						"
					/>
				</div>
			</div>
		</VCard>
	</div>
</template>
