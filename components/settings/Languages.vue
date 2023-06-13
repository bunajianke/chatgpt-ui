<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-list-item
        v-bind="props"
        prepend-icon="mdi-translate"
        :title="$t('language')"
      ></v-list-item>
    </template>
    <v-card>
      <v-toolbar>
        <v-btn icon @click="dialog = false">
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t("language") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn variant="text" @click="dialog = false"> Save </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-list>
        <v-list-item
          v-for="l in locales"
          :key="l.code"
          :title="l.name"
          :append-icon="radioIcon(l.code)"
          @click="updateLocale(l.code)"
        >
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup>
const dialog = ref(false);
const { locale, locales, setLocale } = useI18n();
const { $i18n } = useNuxtApp();

// const usingDeviceLanguage = () => {
//   return ($i18n.getLocaleCookie() === undefined || $i18n.getLocaleCookie() === 'undefined')
// }

const updateLocale = (lang) => {
  setLocale(lang);
};

const radioIcon = (code) => {
  return code === locale.value ? "mdi-radiobox-marked" : "mdi-radiobox-blank";
};

// const useDeviceLanguage = () => {
//   setLocale($i18n.getBrowserLocale())
//   $i18n.setLocaleCookie(undefined)
// }
</script>
