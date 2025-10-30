<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { isDeepStrictEqual } from "node:util";

import { allFormats } from "~/datePresets";

import VDisplayDatePreset from "./VDisplayDatePreset.vue";

import type { AutoTimelineSettings, DateFormatPreset } from "~/types";

const { t } = useI18n();

const props = defineProps<{
  modelValue: AutoTimelineSettings;
}>();

const emit = defineEmits<{
  "update:modelValue": [payload: Partial<AutoTimelineSettings>];
}>();

const presets: DateFormatPreset[] = allFormats.map((fn) => fn({ t }));

const selectedPresetName = computed(() => {
  const appSettings = props.modelValue;
  const presetMatch = presets.find(({ settings: presetSettings }) => {
    return (
      appSettings.dateDisplayFormat === presetSettings.dateDisplayFormat &&
      appSettings.dateParserGroupPriority ===
        presetSettings.dateParserGroupPriority &&
      appSettings.applyAdditonalConditionFormatting ===
        presetSettings.applyAdditonalConditionFormatting &&
      isDeepStrictEqual(
        appSettings.dateTokenConfiguration,
        presetSettings.dateTokenConfiguration,
      )
    );
  });

  if (!presetMatch) return null;
  return presetMatch.name;
});
</script>

<template>
  <div class="v-grid-display">
    <VDisplayDatePreset
      @click="emit('update:modelValue', preset.settings)"
      v-for="preset in presets"
      :preset
      :is-selected="selectedPresetName === preset.name"
      t
      :key="preset.name"
    ></VDisplayDatePreset>
  </div>
</template>
