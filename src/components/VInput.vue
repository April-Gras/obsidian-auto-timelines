<script setup lang="ts" generic="T extends 'text' | 'number'">
import { computed } from "vue";

import VLabel from "./VLabel.vue";
import type { TranslateResult } from "vue-i18n";

type V = T extends "number" ? number : string;

const props = defineProps<{
  modelValue: V;
  inputId: string;
  type: T;
  placeholder?: string | TranslateResult;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: V): void;
}>();

defineSlots<{
  label(props: {}): any;
  description(props: {}): any;
}>();

function handleInputEvent(event: Event) {
  switch (props.type) {
    case "number": {
      return emit(
        "update:modelValue",
        // @ts-expect-error
        Number((event.target as HTMLInputElement).value),
      );
    }
    case "text":
      return emit(
        "update:modelValue",
        // @ts-expect-error
        (event.target as HTMLInputElement).value,
      );
  }
}

const typedType = computed(() => props.type.toString());
</script>

<template>
  <div class="v-input-wrap" :role="typedType">
    <VLabel :input-id="inputId">
      <template #label><slot name="label" /></template>
      <template #description><slot name="description" /></template>
    </VLabel>
    <input
      :id="inputId"
      :min="min"
      :max="max"
      :placeholder="placeholder"
      :value="modelValue"
      :type="typedType"
      @input="handleInputEvent"
    />
  </div>
</template>
