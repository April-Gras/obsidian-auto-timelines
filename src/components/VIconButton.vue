<script setup lang="ts">
import VueFeather from "vue-feather";

import VButton from "./VButton.vue";

defineProps<{
  iconType: string;
  hasAccent?: boolean;
  disabled?: boolean;
}>();

defineSlots<{
  default(props: {}): any;
}>();
</script>

<template>
  <VButton class="iconButton" :has-accent :disabled>
    <template #default>
      <VueFeather class="icon" :type="iconType" />
      <b>
        <slot name="default" />
      </b>
    </template>
  </VButton>
</template>

<style scoped lang="scss">
button.iconButton {
  position: relative;
  display: flex;
  justify-content: center;
  align-content: center;
  gap: 4px;
  cursor: pointer;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
