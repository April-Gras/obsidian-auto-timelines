<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  inputId: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: boolean): void;
}>();

function handleInputEvent() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <div class="v-input-wrap v-checkbox">
    <div>
      <label :for="inputId" v-if="!!$slots.label" class="setting-item-name">
        <slot name="label" />
      </label>
      <summary class="setting-item-description" v-if="!!$slots.description">
        <slot name="description" />
      </summary>
    </div>

    <div
      class="checkbox-container"
      @click="handleInputEvent"
      :class="{ 'is-enabled': modelValue }"
    >
      <input :id="inputId" :value="modelValue" type="checkbox" />
    </div>
  </div>
</template>
