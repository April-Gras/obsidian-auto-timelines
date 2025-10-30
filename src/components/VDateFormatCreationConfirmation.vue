<script setup lang="ts">
import VButton from "./VButton.vue";

import type { DateTokenConfiguration } from "~/types";

defineProps<{
  tokenConfigurations: DateTokenConfiguration[];
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
      <b>{{ $t("settings.text.dateFormatCreationConfirmation.tokens") }}</b>
    </div>
    <ul>
      <li v-for="token in tokenConfigurations">{{ token.name }}</li>
    </ul>
    <hr />
    <p>
      <b>{{ $t("settings.text.dateFormatCreationConfirmation.inputRegex") }}</b>
    </p>
    <p>{{ inputRegex }}</p>
    <hr />
    <p>
      <b>{{
        $t("settings.text.dateFormatCreationConfirmation.outputFormat")
      }}</b>
    </p>
    <p>{{ outputFormat }}</p>
    <VButton @click.native="emit('save')" has-accent>{{
      $t("common.confirm")
    }}</VButton>
  </section>
</template>
