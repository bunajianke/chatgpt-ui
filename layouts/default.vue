<template>
  <v-app :theme="$colorMode.preference">
    <NavigationDrawer />
    <slot />
  </v-app>
</template>

<script setup>
import { useTheme } from "vuetify";

const { $colorMode } = useNuxtApp();
const theme = useTheme();
$colorMode.preference = theme.global.name.value;
</script>
