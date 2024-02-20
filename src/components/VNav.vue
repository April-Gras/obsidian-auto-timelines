<script lang="ts" setup>
const navigationTargets = ["index", "date-formats"] as const;
export type NavigationTarget = (typeof navigationTargets)[number];

defineProps<{
	modelValue: NavigationTarget;
}>();
const emit = defineEmits<{
	(e: "update:modelValue", payload: NavigationTarget): void;
}>();
</script>

<template>
	<nav class="v-nav">
		<ol>
			<li
				v-for="navigationTarget in navigationTargets"
				:class="{
					'v-nav-selected-route': navigationTarget === modelValue,
				}"
				@click="emit('update:modelValue', navigationTarget)"
			>
				{{ $t(`nav.title.${navigationTarget}`) }}
			</li>
		</ol>
	</nav>
</template>
