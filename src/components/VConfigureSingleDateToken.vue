<script setup lang="ts">
import clonedeep from "lodash.clonedeep";
import { availableDateTokenTypeArray, DateTokenType } from "~/types";
import {
	dateTokenConfigurationIsTypeNumber,
	dateTokenConfigurationIsTypeString,
	isDefined,
} from "~/utils";

import VSelect from "~/components/VSelect.vue";
import VInput from "./VInput.vue";
import VButton from "./VButton.vue";

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
	delete: [];
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
		<VButton @click="$emit('delete')">{{ $t("common.remove") }}</VButton>
		<details class="v-grid-display">
			<summary>{{ modelValue.name }}</summary>
			<div style="margin-top: 8px" class="v-grid-display">
				<VSelect
					:model-value="modelValue.type"
					:input-id="`configure-date-token-${modelValue.name}`"
					:options="availableDateTokenTypeArray"
					@update:modelValue="handleUpdateType"
					translation-key="dateTokens.configure"
				>
					<template #label>{{
						$t("settings.label.configureSingleDateToken")
					}}</template>
					<template #description>
						{{
							$t(
								`settings.description.configureSingleDateToken.${modelValue.type}`
							)
						}}
					</template>
				</VSelect>
				<div v-if="dateTokenConfigurationIsTypeNumber(modelValue)">
					<VInput
						:input-id="`configure-single-date-token-min-length-edit-${modelValue.name}`"
						:value="modelValue.minLeght"
						@update:value="
							emit('update:modelValue', {
								...modelValue,
								minLeght: $event,
							})
						"
						type="number"
						:min="0"
						:max="10"
					/>
				</div>
				<ul
					v-if="dateTokenConfigurationIsTypeString(modelValue)"
					class="v-grid-display"
				>
					<VButton @click="addMemberToDictionary" has-accent>{{
						$t("common.add")
					}}</VButton>
					<li
						class="v-grid-display-2"
						v-for="(entry, index) in modelValue.dictionary"
					>
						<VInput
							type="text"
							:inputId="`update-${modelValue.name}-dictionary-value-at-index-${index}`"
							:value="entry"
							:placeholder="
								$t(
									'settings.placeholder.stringTokenDctionaryEntry'
								)
							"
							@update:value="
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
			</div>
		</details>
	</div>
</template>
