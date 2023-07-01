<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

import VInput from "./VInput.vue";

import { formatAbstractDate } from "~/cardMarkup";

import type { DateTokenConfiguration } from "~/types";

const props = defineProps<{
	value: string;
	tokenConfigurations: DateTokenConfiguration[];
}>();

const emit = defineEmits<{
	"update:value": [payload: string];
}>();

const abstractDate = ref(props.tokenConfigurations.map(() => 25));

onMounted(() =>
	emit(
		"update:value",
		props.tokenConfigurations.map(({ name }) => `{${name}}`).join("/")
	)
);

const outputTryout = computed(() => {
	return formatAbstractDate(abstractDate.value, {
		dateDisplayFormat: props.value,
		dateParserGroupPriority: props.tokenConfigurations
			.map(({ name }) => name)
			.join(","),
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
			:value="value"
			@update:value="emit('update:value', $event)"
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
				:value="number"
				type="number"
				@update:value="handleAbstractDateMemberUpdate(index, $event)"
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
