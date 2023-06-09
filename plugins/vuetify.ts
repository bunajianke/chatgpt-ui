import { createVuetify, ThemeDefinition } from "vuetify";
import { aliases, md } from "vuetify/iconsets/md";
import * as components from "vuetify/components";
import { md3 } from "vuetify/blueprints";

const NewDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#2c323b",
    surface: "#171A1F",
    bglighen: "#383e47",
    primary: "#60B4F3",
    "primary-darken-1": "#3700B3",
    secondary: "#03DAC6",
    "secondary-darken-1": "#018786",
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    blueprint: md3,
    icons: {
      defaultSet: "md",
      aliases,
      sets: {
        md,
      },
    },
    theme: {
      defaultTheme: "light",
      themes: {
        NewDark,
      },
    },
    components,
  });

  nuxtApp.vueApp.use(vuetify);
});
