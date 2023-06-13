<template>
  <v-app>
    <v-theme-provider :theme="$colorMode.preference">
      <slot />
    </v-theme-provider>
  </v-app>
</template>
