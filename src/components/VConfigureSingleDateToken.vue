<script setup lang="ts">
import { availableDateTokenTypeArray, DateTokenType } from "~/types";
import {
	dateTokenConfigurationIsTypeNumber,
	dateTokenConfigurationIsTypeString,
} from "~/utils";

import VSelect from "~/components/VSelect.vue";
import VInput from "./VInput.vue";

import type { DateTokenConfiguration } from "~/types";

const { modelValue } = defineProps<{
	modelValue: DateTokenConfiguration;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: DateTokenConfiguration];
}>();
</script>

<template>
	<div class="v-grid-display">
		<details class="v-grid-display">
			<summary>{{ modelValue.name }}</summary>
			<div style="margin-top: 8px" class="v-grid-display">
				<VSelect
					:model-value="modelValue.type"
					:input-id="`configure-date-token-${modelValue.name}`"
					:options="availableDateTokenTypeArray"
					@update:modelValue="
						emit('update:modelValue', {
							...modelValue,
							type: $event,
						})
					"
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
				<div v-if="dateTokenConfigurationIsTypeString(modelValue)">
					<!-- TODO Array of string management -->
				</div>
			</div>
		</details>
	</div>
</template>
