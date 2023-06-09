<script setup>
definePageMeta({
  middleware: ["auth"],
  path: "/:id?",
  keepalive: true,
});

const { $i18n } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const drawer = useDrawer();
const route = useRoute();
const pageLoading = ref(false);
const currentModel = useCurrentModel();
const conversations = useConversations();
const conversation = ref(getDefaultConversationData());

const loadConversation = async () => {
  const { data, error } = await useAuthFetch(
    "/api/chat/conversations/" + route.params.id
  );
  if (!error.value) {
    conversation.value = Object.assign(conversation.value, data.value);
  }
};

const loadMessage = async () => {
  const { data, error } = await useAuthFetch(
    "/api/chat/messages/?conversationId=" + route.params.id
  );
  if (!error.value) {
    conversation.value.messages = data.value;
    conversation.value.id = route.params.id;
  }
};

const createNewConversation = () => {
  if (route.path !== "/") {
    return navigateTo("/?new");
  }
  conversation.value = Object.assign(getDefaultConversationData(), {
    topic: $i18n.t("newConversation"),
  });
};

onMounted(async () => {
  if (route.params.id) {
    conversation.value.loadingMessages = true;
    pageLoading.value = true;
    conversations.value = await getConversations();
    await loadConversation();
    await loadMessage();
    setTimeout(() => {
      conversation.value.loadingMessages = false;
      pageLoading.value = false;
    }, 80);
  }
});

const navTitle = computed(() => {
  if (conversation.value && conversation.value.topic !== null) {
    return conversation.value.topic === ""
      ? $i18n.t("defaultConversationTitle")
      : conversation.value.topic;
  } else {
    return runtimeConfig.public.appName;
  }
});

onActivated(async () => {
  if (route.path === "/" && route.query.new !== undefined) {
    createNewConversation();
  }
});
</script>

<template>
  <v-app-bar class="custom-app-bar">
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>
      <SvgIcon
        v-if="currentModel.name"
        :name="GPT_VERSION[currentModel.name].name"
        :color="GPT_VERSION[currentModel.name].activeColor"
        class="mr-2"
      />
      <span>{{ navTitle }}</span>
    </v-toolbar-title>

    <v-btn
      :title="$t('newConversation')"
      icon="add"
      @click="createNewConversation"
      class="d-md-none ma-3"
    ></v-btn>

    <v-btn
      variant="outlined"
      class="text-none d-none d-md-block"
      @click="createNewConversation"
    >
      {{ $t("newConversation") }}
    </v-btn>
  </v-app-bar>

  <v-main>
    <NewWelcome v-if="!route.params.id && conversation.messages.length === 0" />
    <div v-if="pageLoading" class="h-100 d-flex align-center justify-center">
      <v-progress-circular indeterminate :size="45"></v-progress-circular>
    </div>
    <Conversation :conversation="conversation" />
  </v-main>
</template>

<style lang="less">
.custom-app-bar {
  text-align: center;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px,
    rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;

  .v-toolbar-title__placeholder {
    color: #82888f;
    font-size: 14px;
  }
}

.v-theme--light {
  .custom-app-bar {
    background-color: #f7f7f8;
  }
}

.v-theme--NewDark {
  .custom-app-bar {
    background-color: #383e47;
  }
}
</style>
