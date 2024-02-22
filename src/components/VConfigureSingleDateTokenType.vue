<script setup lang="ts">
import clonedeep from "lodash.clonedeep";
import { availableDateTokenTypeArray, DateTokenType } from "~/types";
import {
	dateTokenConfigurationIsTypeNumber,
	dateTokenConfigurationIsTypeString,
	isDefined,
} from "~/utils";

import VButton from "./VButton.vue";
import VSelect from "./VSelect.vue";
import VInput from "./VInput.vue";
import VCheckbox from "./VCheckbox.vue";

import type { DateTokenConfiguration } from "~/types";

const props = withDefaults(
	defineProps<{
		modelValue: DateTokenConfiguration;
		allowDelete: boolean;
	}>(),
	{
		allowDelete: false,
	}
);

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
}>();

function handleUpdateType($event: DateTokenType) {
	if ($event === DateTokenType.string)
		emit("update:modelValue", {
			...props.modelValue,
			type: $event,
			dictionary: [""],
		});
	else
		emit("update:modelValue", {
			...props.modelValue,
			type: $event,
			minLeght: 0,
			displayWhenZero: true,
			hideSign: false,
		});
}

function addMemberToDictionary() {
	if (!dateTokenConfigurationIsTypeString(props.modelValue)) return;
	const clone = clonedeep(props.modelValue);

	clone.dictionary.push("");
	emit("update:modelValue", clone);
}

function handleDictionaryUpdateAtIndex(
	index: number,
	entryValue?: string
): void {
	if (!dateTokenConfigurationIsTypeString(props.modelValue)) return;
	const clone = clonedeep(props.modelValue);

	if (isDefined(entryValue)) clone.dictionary.splice(index, 1, entryValue);
	else clone.dictionary.splice(index, 1);
	emit("update:modelValue", clone);
}
</script>

<template>
	<div class="v-grid-display">
		<VSelect
			:model-value="modelValue.type"
			:input-id="`configure-date-token-${modelValue.name}`"
			:options="availableDateTokenTypeArray"
			@update:model-value="handleUpdateType"
			translation-key="dateTokens.configure"
		>
			<template #description>
				{{
					$t(
						`settings.description.configureSingleDateToken.${modelValue.type}`
					)
				}}
			</template>
		</VSelect>
		<Transition mode="out-in">
			<div
				key="number"
				class="v-grid-display slim"
				v-if="dateTokenConfigurationIsTypeNumber(modelValue)"
			>
				<VInput
					:input-id="`configure-single-date-token-min-length-edit-${modelValue.name}`"
					:model-value="modelValue.minLeght"
					@update:model-value="
						emit('update:modelValue', {
							...modelValue,
							minLeght: $event,
						})
					"
					type="number"
					:min="0"
					:max="10"
				>
					<template #label>{{
						$t(
							"settings.label.configureSingleDateTokenType.minLength"
						)
					}}</template>
					<template #description>{{
						$t(
							"settings.description.configureSingleDateTokenType.minLength"
						)
					}}</template>
				</VInput>
				<VCheckbox
					:input-id="`configure-single-date-token-hide-sign-edit-${modelValue.name}`"
					:model-value="modelValue.hideSign || false"
					@update:model-value="
						emit('update:modelValue', {
							...modelValue,
							hideSign: $event,
						})
					"
				>
					<template #label>{{
						$t(
							"settings.label.configureSingleDateTokenType.hideSign"
						)
					}}</template>
					<template #description>{{
						$t(
							"settings.description.configureSingleDateTokenType.hideSign"
						)
					}}</template>
				</VCheckbox>
			</div>
			<ul
				v-else-if="dateTokenConfigurationIsTypeString(modelValue)"
				class="v-grid-display"
				key="string"
			>
				<VButton @click="addMemberToDictionary" has-accent>{{
					$t("common.add")
				}}</VButton>
				<li
					class="slim"
					:class="
						modelValue.dictionary.length > 1
							? 'v-grid-display-2'
							: 'v-grid-display'
					"
					v-for="(entry, index) in modelValue.dictionary"
				>
					<VInput
						type="text"
						:inputId="`update-${modelValue.name}-dictionary-value-at-index-${index}`"
						:model-value="entry"
						:placeholder="
							$t('settings.placeholder.stringTokenDctionaryEntry')
						"
						@update:model-value="
							handleDictionaryUpdateAtIndex(index, $event)
						"
					/>
					<VButton
						@click="handleDictionaryUpdateAtIndex(index)"
						v-if="modelValue.dictionary.length > 1"
						>{{ $t("common.remove") }}</VButton
					>
				</li>
			</ul>
		</Transition>
	</div>
</template>

<style scoped lang="scss">
ul {
	list-style-type: none;
	padding-inline-start: 0px;
	margin-inline-start: 0px;
	margin-inline-end: 0px;
}
</style>
