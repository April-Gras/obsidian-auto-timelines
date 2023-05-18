<script setup lang="ts">
import { computed, ref, onActivated } from "vue";

import VInput from "./VInput.vue";

import { formatAbstractDate } from "~/cardMarkup";

const props = defineProps<{
	value: string;
	tokens: string[];
}>();

const emit = defineEmits<{
	"update:value": [payload: string];
}>();

let abstractDate = ref(props.tokens.map(() => 25));

onActivated(() => (abstractDate = ref(props.tokens.map(() => 25))));
const outputTryout = computed(() => {
	return formatAbstractDate(abstractDate.value, {
		dateDisplayFormat: props.value,
		dateParserGroupPriority: props.tokens.join(","),
	});
});
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
		<VInput
			v-for="(number, index) in abstractDate"
			:value="number"
			type="number"
			@update:value="abstractDate[index] = $event"
			:input-id="`tryout-output-${index}`"
		>
			<template #label>{{ tokens[index] }}</template>
			<template #description>{{
				$t("settings.description.tryoutOuput")
			}}</template>
		</VInput>
		<i18n-t
			scope="global"
			keypath="settings.text.outputTryoutResult"
			tag="p"
		>
			<template #formatedDate>
				<b>{{ outputTryout }}</b>
			</template>
		</i18n-t>
	</section>
</template>
