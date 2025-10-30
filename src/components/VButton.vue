<script setup lang="ts">
export type VButtonProps = {
  hasAccent?: boolean;
  disabled?: boolean;
};

withDefaults(defineProps<VButtonProps>(), {
  hasAccent: false,
  disabled: false,
});
</script>
<template>
  <button :disabled="disabled" :class="{ 'mod-cta': hasAccent }">
    <slot v-if="!!$slots.default" />
  </button>
</template>
