<script setup lang="ts">
import { computed, ref, watch } from "vue";
import VInput from "./VInput.vue";

import { getAbstractDateFromData } from "~/cardData";

import type { DateTokenConfiguration } from "~/types";

const props = defineProps<{
	value: string;
	tokenConfigurations: DateTokenConfiguration[];
}>();

const template = ref(
	props.tokenConfigurations.map((e) => `{${e.name}}`).join("-")
);
const tryoutInput = ref("");

function generateInputRegex() {
	const reg = /{(?<token>\w*)}(?<separator>[^{]*)/gim;
	const matches = [...template.value.matchAll(reg)];

	if (!matches) return "";

	return [...matches]
		.map((match) => {
			if (match.groups)
				return `(?<${match.groups.token}>-?[0-9]*)${match.groups.separator}`;
			else throw new Error("Missing group in match");
		})
		.join("");
}

const tryOutResults = computed(() => {
	try {
		return getAbstractDateFromData(
			props.tokenConfigurations.map((e) => e.name),
			tryoutInput.value,
			generateInputRegex()
		);
	} catch (_) {
		return undefined;
	}
});

function updateParentWithRegex() {
	emit("update:value", generateInputRegex() ?? "");
}

updateParentWithRegex();
watch(template, updateParentWithRegex);

const emit = defineEmits<{
	"update:value": [payload: string];
}>();
</script>

<template>
	<section class="v-grid-display">
		<VInput
			v-model:value="template"
			input-id="create-date-output-format"
			type="text"
		>
			<template #label>Sample label</template>
			<template #description> Sample description </template>
		</VInput>
		<hr />
		<VInput v-model:value="tryoutInput" input-id="tryout-input" type="text">
			<template #label>{{
				$t("settings.label.tryYourInputFormat")
			}}</template>
			<template #description>{{
				$t("settings.description.tryYourInputFormat")
			}}</template>
		</VInput>
		<Transition mode="out-in">
			<ul v-if="tryOutResults">
				<li v-for="(value, index) in tryOutResults">
					<b>{{ tokenConfigurations[index].name }}</b>
					<span>-></span>
					<span>{{ value }}</span>
				</li>
			</ul>
			<div v-else style="color: var(--color-red)">
				{{ $t("settings.text.tryoutDoesNotResolve") }}
			</div>
		</Transition>
	</section>
</template>
