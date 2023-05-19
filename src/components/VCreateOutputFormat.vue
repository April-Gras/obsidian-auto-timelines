<script setup lang="ts">
import { computed, ref, onActivated, onBeforeMount, onMounted } from "vue";

import VInput from "./VInput.vue";

import { formatAbstractDate } from "~/cardMarkup";

const props = defineProps<{
	value: string;
	tokens: string[];
}>();

const emit = defineEmits<{
	"update:value": [payload: string];
}>();

const abstractDate = ref(props.tokens.map(() => 25));

onMounted(() =>
	emit("update:value", props.tokens.map((token) => `{${token}}`).join("/"))
);

const outputTryout = computed(() => {
	return formatAbstractDate(abstractDate.value, {
		dateDisplayFormat: props.value,
		dateParserGroupPriority: props.tokens.join(","),
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
				<template #label>{{ tokens[index] }}</template>
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
