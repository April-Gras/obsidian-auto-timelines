<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

import VInput from "./VInput.vue";

import { formatAbstractDate } from "~/abstractDateFormatting";

import type { DateTokenConfiguration } from "~/types";

const props = defineProps<{
	modelValue: string;
	tokenConfigurations: DateTokenConfiguration[];
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: string];
}>();

const abstractDate = ref(props.tokenConfigurations.map(() => 25));

onMounted(() =>
	emit(
		"update:modelValue",
		props.tokenConfigurations.map(({ name }) => `{${name}}`).join("/")
	)
);

const outputTryout = computed(() => {
	return formatAbstractDate(abstractDate.value, {
		dateDisplayFormat: props.modelValue,
		dateParserGroupPriority: props.tokenConfigurations
			.map((e) => e.name)
			.join(","),
		dateTokenConfiguration: props.tokenConfigurations,
		applyAdditonalConditionFormatting: false,
	});
});

function handleAbstractDateMemberUpdate(index: number, $event: number) {
	abstractDate.value.splice(index, 1, $event);
}
</script>

<template>
	<section class="v-grid-display">
		<VInput
			type="text"
			:model-value="modelValue"
			@update:model-value="emit('update:modelValue', $event)"
			input-id="create-date-output-format"
		>
			<template #label>
				{{ $t("settings.label.dateDisplayFormat") }}
			</template>
			<template #description>
				{{ $t("settings.description.dateDisplayFormat") }}
			</template>
		</VInput>
		<hr />
		<section class="v-grid-display-2">
			<VInput
				v-for="(number, index) in abstractDate"
				:model-value="number"
				type="number"
				@update:model-value="
					handleAbstractDateMemberUpdate(index, $event)
				"
				:input-id="`tryout-output-${index}`"
			>
				<template #label>{{
					tokenConfigurations[index].name
				}}</template>
			</VInput>
		</section>
		<i18n-t
			scope="global"
			keypath="settings.text.outputTryoutResult"
			tag="p"
			v-if="outputTryout"
		>
			<template #formatedDate>
				<b>{{ outputTryout }}</b>
			</template>
		</i18n-t>
		<div v-else style="color: var(--color-red)">
			{{ $t("settings.text.outputTryoutDoesNotResolve") }}
		</div>
	</section>
</template>
