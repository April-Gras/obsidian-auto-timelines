<script lang="ts" setup>
import VCard from "~/components/VCard.vue";
import VueFeather from "vue-feather";
import VIconButton from "./VIconButton.vue";

import type { DateFormatPreset } from "~/types";

withDefaults(
  defineProps<{
    preset: DateFormatPreset;
    isSelected?: boolean;
  }>(),
  {
    isSelected: false,
  },
);
</script>

<template>
  <VCard clickable>
    <div class="v-grid-display root">
      <div class="v-inline-flex-display head">
        <VIconButton :icon-type="preset.icon" :has-accent="isSelected">
          <h4>{{ $t(`datePreset.title.${preset.name}`) }}</h4>
        </VIconButton>
      </div>
      <div class="v-inline-flex-display">
        <div class="text">
          <span>{{ $t("common.input") }}</span>
          <i>{{ $t(`datePreset.sampleInput.${preset.name}`) }}</i>
        </div>
        <VueFeather style="flex-shrink: 0" type="arrow-right" />
        <div class="text inverted">
          <span>{{ $t("common.output") }}</span>
          <b>{{ $t(`datePreset.sampleOutput.${preset.name}`) }}</b>
        </div>
      </div>
      <div style="text-align: left">
        {{ $t(`datePreset.description.${preset.name}`) }}
      </div>
    </div>
  </VCard>
</template>

<style lang="scss" scoped>
.text {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  align-content: center;
  border: 1px solid var(--color-base-70);
  border-radius: 4px;
  padding: 8px 16px;
  gap: 4;

  &.inverted {
    border: 1px solid var(--color-base-20);
    background-color: var(--color-base-70);
    color: var(--color-base-20);
  }
}

.v-grid-display .root {
  position: relative;
}

.v-inline-flex-display .head {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-base-20);
  width: 100%;
}

button.iconButton {
  width: 100%;
}
</style>
