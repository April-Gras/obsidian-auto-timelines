<script setup lang="ts">
import { computed } from "vue";

import VInput from "./VInput.vue";
import VButton from "./VButton.vue";
import { SETTINGS_DEFAULT } from "~/settings";

import type { AutoTimelineSettings } from "~/types";
import { createDefaultDateConfiguration } from "~/utils";
import VConfigureDateTokenArray from "./VConfigureDateTokenArray.vue";
import VHeader from "./VHeader.vue";
import VWarningBlock from "./VWarningBlock.vue";

const props = defineProps<{
	value: AutoTimelineSettings;
}>();

const emit = defineEmits<{
	"update:value": [payload: Partial<AutoTimelineSettings>];
}>();

const targetKeys: Exclude<
	keyof AutoTimelineSettings,
	"dateTokenConfiguration" | "lookForTagsForTimeline"
>[] = ["dateParserRegex", "dateParserGroupPriority", "dateDisplayFormat"];

const unconfiguredTokens = computed(() => {
	return props.value.dateParserGroupPriority
		.split(",")
		.filter(
			(tokenName) =>
				!props.value.dateTokenConfiguration.some(
					({ name }) => name === tokenName
				)
		);
});

function handleTokenResync() {
	emit("update:value", {
		dateTokenConfiguration: [
			...props.value.dateTokenConfiguration,
			...unconfiguredTokens.value.map((name) =>
				createDefaultDateConfiguration({ name })
			),
		],
	});
}

function handleResetToDefault(): void {
	emit("update:value", {
		...targetKeys.reduce((accumulator, key) => {
			accumulator[key] = SETTINGS_DEFAULT[key];
			return accumulator;
		}, {} as Partial<AutoTimelineSettings>),
		dateTokenConfiguration: [
			createDefaultDateConfiguration({ name: "year", minLeght: 4 }),
			createDefaultDateConfiguration({ name: "month" }),
			createDefaultDateConfiguration({ name: "day" }),
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
			:value="value[key]"
			@update:value="emit('update:value', { [key]: $event })"
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
			:model-value="value.dateTokenConfiguration"
			@update:model-value="
				emit('update:value', { dateTokenConfiguration: $event })
			"
		/>
	</section>
</template>
