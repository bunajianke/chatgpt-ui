<script setup>
import dayjs from "dayjs";
import { useDisplay, useTheme } from "vuetify";
import { useDrawer } from "../composables/states";

const route = useRoute();
const keyword = ref("");
const { $i18n, $settings } = useNuxtApp();
const colorMode = useColorMode();
const vtheme = useTheme();
const { mdAndUp, mobile } = useDisplay();
const drawerPermanent = ref(false);
drawerPermanent.value = mdAndUp.value;
const user = useUser();

const themes = ref([
  { title: $i18n.t("lightMode"), value: "light" },
  { title: $i18n.t("darkMode"), value: "dark" },
]);
const setTheme = (theme) => {
  colorMode.preference = theme;
  vtheme.global.name.value = theme;
};

const conversations = ref(useConversations());

const editingConversation = ref(false);
const deletingConversationIndex = ref(false);

const editConversation = (id) => {
  const index = conversations.value.findIndex((i) => i.id === id);
  editingConversation.value = conversations.value[index];
};

const updateConversation = async (id) => {
  const index = conversations.value.findIndex((i) => i.id === id);
  editingConversation.value.updating = true;
  const { data, error } = await useAuthFetch(
    `/api/chat/conversations/${editingConversation.value.id}/`,
    {
      method: "PUT",
      body: JSON.stringify({
        topic: editingConversation.value.topic,
      }),
    }
  );
  if (!error.value) {
    editingConversation.value.updating = false;
    conversations.value[index] = editingConversation.value;
  }
  conversations.value[index].updating = false;
  editingConversation.value = false;
};

const deleteConversation = async (id) => {
  const index = conversations.value.findIndex((i) => i.id === id);
  deletingConversationIndex.value = index;
  const { data, error } = await useAuthFetch(
    `/api/chat/conversations/${conversations.value[index].id}/`,
    {
      method: "DELETE",
    }
  );
  deletingConversationIndex.value = null;
  if (!error.value) {
    const deletingConversation = conversations.value[index];
    conversations.value.splice(index, 1);
    if (
      route.params.id &&
      parseInt(route.params.id) === deletingConversation.id
    ) {
      await navigateTo("/");
    }
  }
};

const snackbar = ref(false);
const snackbarText = ref("");
const showSnackbar = (text) => {
  snackbarText.value = text;
  snackbar.value = true;
};

const loadMessage = async (conversation_id) => {
  const { data, error } = await useAuthFetch(
    `/api/chat/messages/?conversationId=${conversation_id}`
  );
  if (!error.value) {
    return data.value;
  }
  return error.value;
};

const exportConversation = async (id) => {
  const index = conversations.value.findIndex((i) => i.id === id);
  let conversation = conversations.value[index];
  let data = {};
  data.conversation_topic = conversation.topic;
  data.messages = [];
  let messages = await loadMessage(conversation.id);
  for (let message of messages) {
    let msg = {};
    msg.role = message.is_bot ? "assistant" : "user";
    msg.content = message.message;
    data.messages.push(msg);
  }
  let file_content = JSON.stringify(data);
  let file_name = `${conversation.topic}_${dayjs().format(
    "YYYY_MM_DD_HH_mm_ss"
  )}`;
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(file_content)
  );
  element.setAttribute("download", file_name);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const openImportFileChooser = async () => {
  let input_element = document.getElementById("import_conversation_input");
  input_element.click();
};

const importConversation = async () => {
  let input_element = document.getElementById("import_conversation_input");
  let fileHandles = input_element.files;
  let imports = [];
  const reader = new FileReader();
  for (let handle of fileHandles) {
    let content = await new Promise((resolve, reject) => {
      reader.readAsText(handle);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (eror) => reject(error);
    });
    let json = JSON.parse(content);
    imports.push(json);
  }
  let new_conversation_ids = [];
  try {
    const { data, error } = await useAuthFetch("/api/upload_conversations/", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imports: imports,
      }),
    });
    if (!error.value) {
      new_conversation_ids = data.value;
      loadConversations();
    } else {
      console.log(err);
      showSnackbar(err.message);
    }
  } catch (err) {
    console.log(err.message);
    showSnackbar(err.message);
  }
};

const clearConversations = async () => {
  deletingConversations.value = true;
  const { data, error } = await useAuthFetch(
    `/api/chat/conversations/delete_all`,
    {
      method: "DELETE",
    }
  );
  if (!error.value) {
    loadConversations();
    clearConfirmDialog.value = false;
  }
  deletingConversations.value = false;
};

const clearConfirmDialog = ref(false);
const deletingConversations = ref(false);
const loadingConversations = ref(false);

const dayCates = ref({
  today: [],
  yesterday: [],
  sevenDays: [],
  before7Days: [],
});

const cateLabel = {
  today: "今天",
  yesterday: "昨天",
  sevenDays: "近七天",
  before7Days: "七天前",
};

const updateDateCate = () => {
  const { today, yesterday, sevenDays } = generateDayList();
  for (const key in dayCates.value) {
    dayCates.value[key] = [];
  }
  for (const con of conversations.value) {
    const datetime = dayjs(con.created_at).valueOf();
    if (datetime >= today) {
      dayCates.value.today = [...dayCates.value.today, con];
    } else if (datetime > yesterday && datetime < today) {
      dayCates.value.yesterday.push(con);
    } else if (datetime < yesterday && datetime > sevenDays) {
      dayCates.value.sevenDays.push(con);
    } else if (datetime < sevenDays) {
      dayCates.value.before7Days.push(con);
    }
  }
};

watchEffect(() => {
  conversations?.value && updateDateCate();
});

const searchList = (list) => {
  return (
    list.filter(
      (i) => i.topic.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1
    ) || []
  );
};

const loadConversations = async () => {
  loadingConversations.value = true;
  conversations.value = await getConversations();
  loadingConversations.value = false;
  if (unref(drawer) && unref(mobile)) {
    setTimeout(() => {
      drawer.value = false;
    }, 1000);
  }
};

const signOut = async () => {
  const { error } = await useFetch("/api/account/logout/", {
    method: "POST",
  });
  if (!error.value) {
    await logout();
  }
};

onNuxtReady(async () => {
  loadConversations();
});

const drawer = useDrawer();

const handleNavigate = async (id) => {
  await navigateTo(id ? `/${id}` : "/");
};
</script>

<template>
  <v-navigation-drawer
    theme="dark"
    v-model="drawer"
    :permanent="drawerPermanent"
    width="300"
  >
    <template v-slot:prepend v-if="user">
      <v-list>
        <v-list-item :title="user.username" style="padding: 6px 20px">
          <template #subtitle>
            <div class="pt-1 d-flex align-center">
              <span class="mr-3">点数：34</span>
              <v-btn size="x-small" variant="text">升级会员</v-btn>
            </div>
          </template>

          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon color="white">mdi-folder</v-icon>
            </v-avatar>
          </template>

          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="#8d8d9f"
                  v-bind="props"
                  size="normal"
                  variant="text"
                  icon="mdi-dots-horizontal"
                ></v-btn>
              </template>

              <v-list>
                <v-list-item
                  :title="$t('resetPassword')"
                  to="/account/resetPassword"
                >
                </v-list-item>
                <v-list-item :title="$t('signOut')" @click="signOut">
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
        <v-divider
          :thickness="1"
          class="border-opacity-50 mx-4 mt-2"
        ></v-divider>

        <v-list-item class="pt-4">
          <v-input class="search-input" hide-details>
            <div class="d-flex align-center">
              <SvgIcon
                v-slot:prepend-inner-icon
                name="search"
                width="25px"
                height="30px"
              />
              <input
                class="flex-1"
                v-model="keyword"
                placeholder="搜索话题"
                style="font-size: 14px"
                type="text"
              />
              <v-btn
                v-slot:append
                v-show="keyword.length"
                density="compact"
                icon="mdi-close-circle"
                variant="text"
                size="small"
                color="#fff"
                class="ml-5"
                @click="keyword = ''"
              ></v-btn>
            </div>
          </v-input>
        </v-list-item>
      </v-list>
    </template>

    <div class="px-2">
      <v-list nav>
        <v-list-item v-show="loadingConversations">
          <v-list-item-title class="d-flex justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-list-item-title>
        </v-list-item>

        <template v-for="(conversations, field) in dayCates" :key="field">
          <div
            class="conversations-list"
            v-if="searchList(conversations).length"
          >
            <p class="day-label-text">{{ cateLabel[field] }}</p>
            <template
              v-for="conversation in searchList(conversations)"
              :key="conversation.id"
            >
              <v-list-item
                rounded="rounded"
                v-if="
                  editingConversation &&
                  editingConversation.id === conversation.id
                "
              >
                <template #prepend>
                  <SvgIcon name="chat" style="font-size: 20px"></SvgIcon>
                </template>

                <v-text-field
                  style="margin-left: 14px"
                  v-model="editingConversation.topic"
                  :loading="editingConversation.updating"
                  variant="solo"
                  hide-details
                  density="compact"
                  autofocus
                  @keyup.enter="updateConversation(conversation.id)"
                >
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-check"
                      size="small"
                      variant="text"
                      @click.prevent="updateConversation(conversation.id)"
                    ></v-btn>
                  </template>
                </v-text-field>
              </v-list-item>

              <v-hover
                v-if="
                  !editingConversation ||
                  editingConversation.id !== conversation.id
                "
                v-slot="{ isHovering, props }"
              >
                <v-list-item
                  rounded="rounded"
                  v-bind="props"
                  :active="isHovering || route.params.id == conversation.id"
                  @click="handleNavigate(conversation.id)"
                >
                  <template #prepend>
                    <SvgIcon name="chat" style="font-size: 16px"></SvgIcon>
                  </template>

                  <v-list-item-title style="font-size: 14px; margin-left: 14px">
                    <div>
                      {{
                        conversation?.topic
                          ? conversation.topic
                          : $t("defaultConversationTitle")
                      }}
                    </div>
                  </v-list-item-title>

                  <template v-slot:append>
                    <div v-if="mobile" class="px-1">
                      <v-btn
                        color="#8d8d9f"
                        v-bind="props"
                        size="normal"
                        variant="text"
                      >
                        <v-icon icon="mdi-dots-horizontal"></v-icon>
                        <v-menu activator="parent" open-on-click>
                          <v-list>
                            <v-list-item
                              title="编辑"
                              @click.prevent="editConversation(conversation.id)"
                            >
                            </v-list-item>
                            <v-list-item
                              title="分享"
                              @click.prevent="
                                exportConversation(conversation.id)
                              "
                            >
                            </v-list-item>
                            <v-list-item
                              title="删除"
                              @click.prevent="
                                deleteConversation(conversation.id)
                              "
                            >
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-btn>
                    </div>
                    <div
                      v-else
                      v-show="isHovering && conversation.id"
                      class="px-1"
                      style="font-size: 17px"
                    >
                      <SvgIcon
                        title="编辑"
                        name="edit"
                        @click.prevent="editConversation(conversation.id)"
                      />

                      <SvgIcon
                        title="分享"
                        class="ml-2"
                        name="download"
                        @click.prevent="exportConversation(conversation.id)"
                      />

                      <SvgIcon
                        title="删除"
                        class="ml-2"
                        name="delete"
                        :loading="deletingConversationIndex === conversation.id"
                        @click.prevent="deleteConversation(conversation.id)"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-hover>
            </template>
          </div>
        </template>
      </v-list>
    </div>

    <template v-slot:append>
      <v-divider
        :thickness="1"
        class="title-divider border-opacity-50 mx-4 mt-2"
      ></v-divider>

      <v-menu location="top center" transition="slide-y-reverse-transition">
        <template #activator="{ props }">
          <div v-bind="props" class="w-100 d-flex align-center pa-5">
            <SvgIcon name="setting" class="mr-3"></SvgIcon>
            <span class="flex-fill">{{ $t("settingDraw") }}</span>
            <v-icon
              class="justify-flex-end"
              icon="mdi-dots-horizontal"
            ></v-icon>
          </div>
        </template>

        <v-list>
          <v-list-item prepend-icon="mdi-help-box-outline" @click="signOut">
            <v-list-item-title>Help & FAQ</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>

          <v-dialog v-model="clearConfirmDialog" persistent>
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-delete-sweep-outline"
                :title="$t('clearConversations')"
              ></v-list-item>
            </template>
            <v-card>
              <v-card-title class="text-h5">
                Are you sure you want to delete all conversations?
              </v-card-title>
              <v-card-text
                >This will be a permanent deletion and cannot be retrieved once
                deleted. Please proceed with caution.</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="clearConfirmDialog = false"
                  class="text-none"
                >
                  Cancel deletion
                </v-btn>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="clearConversations"
                  class="text-none"
                  :loading="deletingConversations"
                >
                  Confirm deletion
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <ModelParameters />

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="$t('themeMode')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-theme-light-dark"></v-icon>
                </template>
              </v-list-item>
            </template>
            <v-list bg-color="white">
              <v-list-item
                v-for="(theme, idx) in themes"
                :key="idx"
                @click="setTheme(theme.value)"
              >
                <v-list-item-title>{{ theme.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <SettingsLanguages />

          <v-divider></v-divider>

          <v-list-item
            prepend-icon="mdi-logout-variant"
            :title="$t('signOut')"
            @click="signOut"
          ></v-list-item>
        </v-list>
      </v-menu>

      <v-list style="display: none">
        <v-menu location="top center">
          <template v-slot:activator="{ props }">
            <v-list-item class="px-5" v-bind="props">
              <template #prepend>
                <SvgIcon name="setting" class="mr-3"></SvgIcon>
              </template>
              <v-list-item-title>{{ $t("settingDraw") }}</v-list-item-title>
              <template #append>
                <v-icon icon="mdi-dots-horizontal"></v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list density="compact">
            <v-list-item prepend-icon="mdi-help-box-outline" @click="signOut">
              <v-list-item-title>Help & FAQ</v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <ApiKeyDialog v-if="$settings.open_api_key_setting === 'True'" />

            <v-dialog v-model="clearConfirmDialog" persistent>
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-delete-sweep-outline"
                  :title="$t('clearConversations')"
                ></v-list-item>
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  Are you sure you want to delete all conversations?
                </v-card-title>
                <v-card-text
                  >This will be a permanent deletion and cannot be retrieved
                  once deleted. Please proceed with caution.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="green-darken-1"
                    variant="text"
                    @click="clearConfirmDialog = false"
                    class="text-none"
                  >
                    Cancel deletion
                  </v-btn>
                  <v-btn
                    color="green-darken-1"
                    variant="text"
                    @click="clearConversations"
                    class="text-none"
                    :loading="deletingConversations"
                  >
                    Confirm deletion
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <ModelParameters />

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  rounded="xl"
                  :title="$t('themeMode')"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-theme-light-dark"></v-icon>
                  </template>
                </v-list-item>
              </template>
              <v-list bg-color="white">
                <v-list-item
                  v-for="(theme, idx) in themes"
                  :key="idx"
                  @click="setTheme(theme.value)"
                >
                  <v-list-item-title>{{ theme.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <SettingsLanguages />

            <v-divider></v-divider>

            <v-list-item
              prepend-icon="mdi-logout-variant"
              :title="$t('signOut')"
              @click="signOut"
            ></v-list-item>
          </v-list>
        </v-menu>
      </v-list>

      <!-- <v-expansion-panels style="flex-direction: column">
        <v-expansion-panel :rounded="false">
          <v-expansion-panel-title
            class="with-border-top"
            expand-icon="mdi-dots-horizontal"
            collapse-icon="mdi-close"
          >
            <v-divider
              :thickness="1"
              class="title-divider border-opacity-50 mx-4 mt-2"
            ></v-divider>
            <SvgIcon name="setting" class="mr-3"></SvgIcon>
            <span style="font-size: 14px">{{ $t("settingDraw") }}</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="px-1">
              <v-list density="compact">
                <v-dialog v-model="clearConfirmDialog" persistent>
                  <template v-slot:activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      rounded="xl"
                      prepend-icon="mdi-delete-sweep-outline"
                      :title="$t('clearConversations')"
                    ></v-list-item>
                  </template>
                  <v-card>
                    <v-card-title class="text-h5">
                      Are you sure you want to delete all conversations?
                    </v-card-title>
                    <v-card-text
                      >This will be a permanent deletion and cannot be retrieved
                      once deleted. Please proceed with caution.</v-card-text
                    >
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="green-darken-1"
                        variant="text"
                        @click="clearConfirmDialog = false"
                        class="text-none"
                      >
                        Cancel deletion
                      </v-btn>
                      <v-btn
                        color="green-darken-1"
                        variant="text"
                        @click="clearConversations"
                        class="text-none"
                        :loading="deletingConversations"
                      >
                        Confirm deletion
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-list-item
                  rounded="xl"
                  prepend-icon="mdi-import"
                  :title="$t('importConversation')"
                  @click="openImportFileChooser()"
                ></v-list-item>

                <ApiKeyDialog
                  v-if="$settings.open_api_key_setting === 'True'"
                />

                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      rounded="xl"
                      :title="$t('themeMode')"
                    >
                      <template v-slot:prepend>
                        <v-icon icon="mdi-theme-light-dark"></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <v-list bg-color="white">
                    <v-list-item
                      v-for="(theme, idx) in themes"
                      :key="idx"
                      @click="setTheme(theme.value)"
                    >
                      <v-list-item-title>{{ theme.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <SettingsLanguages />
              </v-list>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels> -->
    </template>
  </v-navigation-drawer>

  <v-snackbar v-model="snackbar" multi-line location="top">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn
        color="red"
        variant="text"
        @click="snackbar = false"
        density="compact"
        size="default"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>

  <input
    type="file"
    id="import_conversation_input"
    style="display: none"
    accept="text/plain, text/json"
    multiple
    @change="importConversation"
  />
</template>

<style lang="less">
.v-navigation-drawer__content::-webkit-scrollbar {
  width: 0;
}

.v-navigation-drawer__content:hover::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer__content:hover::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 3px;
}

.conversations-list + .conversations-list {
  margin-top: 16px;
}

.search-input {
  padding: 10px;
  border-radius: 4px;
  background: #2e3135;

  input {
    border: none;
    outline: none;
    padding-left: 6px;
  }
}

.day-label-text {
  font-size: 12px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.v-theme--dark {
  .search-input {
    background: #2e3135;
  }

  .day-label-text {
    color: #a1aab6;
  }
}

.v-expansion-panel-title.with-border-top {
  position: relative;

  .title-divider {
    position: absolute;
    left: 0;
    top: -10px;
    width: calc(100% - 32px);
  }
}
</style>
