<script setup lang="ts">
import { useSlots } from "vue";
import { hasSlot } from "~/composable/hasSlot";

defineProps<{
  inputId: string;
}>();

defineSlots<{
  label(props: {}): any;
  description(props: {}): any;
}>();

const slots = useSlots();

const hasLabel = hasSlot(slots["label"]);
const hasDescription = hasSlot(slots["description"]);
</script>

<template>
  <div v-if="hasLabel || hasDescription">
    <label :for="inputId" class="setting-item-name" v-if="hasLabel">
      <slot name="label" />
    </label>
    <summary class="setting-item-description" v-if="hasDescription">
      <slot name="description" />
    </summary>
  </div>
</template>
