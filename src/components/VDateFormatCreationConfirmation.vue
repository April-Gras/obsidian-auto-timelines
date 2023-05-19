<script setup lang="ts">
import VButton from "./VButton.vue";

defineProps<{
	tokens: string[];
	inputRegex: string;
	outputFormat: string;
}>();

const emit = defineEmits<{
	save: [void];
}>();
</script>
<template>
	<section class="v-grid-display">
		<div>
			<b>{{
				$t("settings.text.dateFormatCreationConfirmation.tokens")
			}}</b>
		</div>
		<ul>
			<li v-for="token in tokens">{{ token }}</li>
		</ul>
		<hr />
		<p>
			<b>{{
				$t("settings.text.dateFormatCreationConfirmation.inputRegex")
			}}</b>
		</p>
		<p>{{ inputRegex }}</p>
		<hr />
		<p>
			<b>{{
				$t("settings.text.dateFormatCreationConfirmation.outputFormat")
			}}</b>
		</p>
		<p>{{ outputFormat }}</p>
		<VButton @click="emit('save')" has-accent>{{
			$t("common.confirm")
		}}</VButton>
	</section>
</template>
