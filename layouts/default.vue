<template>
  <v-app>
    <v-theme-provider :theme="$colorMode.preference">
      <NavigationDrawer />
      <slot />
    </v-theme-provider>
  </v-app>
</template>

<script setup>
import { useTheme } from "vuetify";

const { $colorMode } = useNuxtApp();
const theme = useTheme();
onNuxtReady(() => {
  theme.global.name.value = $colorMode.preference;
});
</script>
