<script setup lang="ts">
import { computed } from "vue";

import VInput from "./VInput.vue";
import VButton from "./VButton.vue";
import VConfigureDateTokenArray from "./VConfigureDateTokenArray.vue";
import VHeader from "./VHeader.vue";
import VWarningBlock from "./VWarningBlock.vue";

import { SETTINGS_DEFAULT } from "~/settings";
import { createNumberDateTokenConfiguration } from "~/utils";

import type { AutoTimelineSettings, PickByType } from "~/types";

const props = defineProps<{
	modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:modelValue": [payload: Partial<AutoTimelineSettings>];
}>();

const targetKeys = [
	"dateParserRegex",
	"dateParserGroupPriority",
	"dateDisplayFormat",
] satisfies (keyof PickByType<AutoTimelineSettings, string>)[];

const unconfiguredTokens = computed(() => {
	return props.modelValue.dateParserGroupPriority
		.split(",")
		.filter(
			(tokenName) =>
				!props.modelValue.dateTokenConfiguration.some(
					({ name }) => name === tokenName
				)
		);
});

function handleTokenResync() {
	emit("update:modelValue", {
		dateTokenConfiguration: [
			...props.modelValue.dateTokenConfiguration,
			...unconfiguredTokens.value.map((name) =>
				createNumberDateTokenConfiguration({ name })
			),
		],
	});
}

function handleResetToDefault(): void {
	emit("update:modelValue", {
		...targetKeys.reduce((accumulator, key) => {
			accumulator[key] = SETTINGS_DEFAULT[key];
			return accumulator;
		}, {} as Partial<AutoTimelineSettings>),
		dateTokenConfiguration: [
			createNumberDateTokenConfiguration({ name: "year", minLeght: 4 }),
			createNumberDateTokenConfiguration({ name: "month" }),
			createNumberDateTokenConfiguration({ name: "day" }),
		],
	});
}
</script>
<template>
	<section class="v-grid-display">
		<VButton @click.native="handleResetToDefault">{{
			$t("settings.button.resetToDefault")
		}}</VButton>
		<VInput
			type="text"
			v-for="key in targetKeys"
			:model-value="modelValue[key]"
			@update:model-value="emit('update:modelValue', { [key]: $event })"
			:input-id="key"
		>
			<template #label>{{ $t(`settings.label.${key}`) }}</template>
			<template #description>{{
				$t(`settings.description.${key}`)
			}}</template>
		</VInput>
		<Transition name="fade">
			<VWarningBlock v-if="!!unconfiguredTokens.length">
				<template #title>{{
					$t("settings.warning.title.tokenMismatch")
				}}</template>
				<template #text>
					<div>
						<ul style="margin: 0px">
							<li v-for="token in unconfiguredTokens">
								{{ token }}
							</li>
						</ul>
						{{ $t("settings.warning.text.tokenMismatchList") }}
					</div>
					<VButton style="margin-top: 8px" @click="handleTokenResync">
						{{ $t("settings.warning.button.syncTokens") }}
					</VButton>
				</template>
			</VWarningBlock>
		</Transition>
		<VHeader>{{
			$t("settings.title.advancedDateFormatsTokenConfiguration")
		}}</VHeader>
		<VConfigureDateTokenArray
			:model-value="modelValue.dateTokenConfiguration"
			display-delete-option
			@update:model-value="
				emit('update:modelValue', { dateTokenConfiguration: $event })
			"
		/>
	</section>
</template>
