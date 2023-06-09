<script setup>
import { isMobile } from "is-mobile";
const { $i18n } = useNuxtApp();

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  sendMessage: {
    type: Function,
    required: true,
  },
  cancelSend: {
    type: Function,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const message = ref("");
const rows = ref(1);
const autoGrow = ref(true);

const regenereateButtonVisible = computed(() => {
  return props.conversation?.messages?.length > 0;
});

const hint = computed(() => {
  return isMobile()
    ? ""
    : $i18n.t("pressEnterToSendYourMessageOrShiftEnterToAddANewLine");
});

watchEffect(() => {
  const lines = message.value.split(/\r\n|\r|\n/).length;
  if (lines > 8) {
    rows.value = 8;
    autoGrow.value = false;
  } else {
    rows.value = lines;
    autoGrow.value = true;
  }
});

const send = () => {
  let msg = message.value;
  // remove the last "\n"
  if (msg[msg.length - 1] === "\n") {
    msg = msg.slice(0, -1);
  }
  if (msg.length > 0) {
    let item = toolSelector.value.list[toolSelector.value.selected];
    console.log(msg);
    props.sendMessage({
      content: msg,
      tool: item.name,
      message_type: item.type,
    });
  }
  message.value = "";
  toolSelector.value.selected = 0;
};

const textArea = ref();
const documentMan = ref(null);

const usePrompt = (prompt) => {
  message.value = prompt;
  textArea.value.focus();
};
const refreshDocList = () => {
  documentMan.value.loadDocs();
};

const clickSendBtn = () => {
  send();
};

const enterOnly = (event) => {
  event.preventDefault();
  if (!isMobile()) {
    send();
  }
};

defineExpose({
  usePrompt,
  refreshDocList,
});

const toolSelector = ref({
  list: [
    { title: "Chat", icon: "add", name: "chat", type: 0 },
    {
      title: "Web Search",
      icon: "travel_explore",
      name: "web_search",
      type: 100,
    },
    { title: "ArXiv", icon: "local_library", name: "arxiv", type: 110 },
  ],
  selected: 0,
});
function getToolIcon() {
  let v = toolSelector.value;
  let icon = v.list[v.selected].icon;
  return icon;
}
function getLabel() {
  let v = toolSelector.value;
  let name = v.list[v.selected].name;
  return "messageLabel." + name;
}
function selectTool(idx) {
  let v = toolSelector.value;
  v.selected = idx;
  let name = v.list[idx].name;
}
const docDialogCtl = ref({
  dialog: false,
});
</script>

<template>
  <div class="d-flex flex-column align-center footer-wrapper">
    <v-btn
      v-if="regenereateButtonVisible && !loading"
      rounded="4px"
      variant="elevated"
      class="regenerate-btn"
      :disabled="loading"
      :color="$colorMode.preference === 'light' ? '#ffffff' : '#2C323B'"
    >
      <div class="d-flex items-center">
        <v-icon
          v-slot:prependIcon
          icon="refresh"
          style="margin-top: 3px"
          size="small"
        ></v-icon>
        <span class="ml-1">重新生成答案</span>
      </div>
    </v-btn>

    <v-btn
      v-else-if="loading"
      rounded="4px"
      variant="elevated"
      class="regenerate-btn"
      :color="$colorMode.preference === 'light' ? '#ffffff' : '#2C323B'"
      @click="cancelSend"
    >
      <div class="d-flex items-center">
        <v-icon
          v-slot:prependIcon
          icon="cancel_schedule_send"
          style="margin-top: 3px"
          size="small"
        ></v-icon>
        <span class="ml-1">停止生成</span>
      </div>
    </v-btn>

    <div class="flex-grow-1 d-flex align-center justify-space-between w-100">
      <v-textarea
        ref="textArea"
        v-model="message"
        rounded="lg"
        max-rows="8"
        :placeholder="hint"
        :rows="rows"
        :auto-grow="autoGrow"
        :disabled="disabled"
        :loading="loading"
        :hide-details="true"
        :clearable="true"
        variant="outlined"
        class="userinputmsg"
        @keydown.enter.exact="enterOnly"
      >
        <template #append-inner>
          <v-btn
            :disabled="loading"
            variant="text"
            icon="send"
            title="Send"
            class="ml-3"
            size="large"
            @click.stop="clickSendBtn"
          ></v-btn>
        </template>
      </v-textarea>

      <v-btn
        style="margin-left: 16px; width: 50px; height: 50px; min-width: initial"
        title="Tools"
        class="tool-icon-btn custom-add-btn"
        id="tools_btn"
        rounded="lg"
        variant="plain"
        :color="$colorMode.preference === 'light' ? '#2bb673' : '#5195f6'"
      >
        <v-icon :icon="getToolIcon()" size="x-large"></v-icon>
      </v-btn>

      <v-menu activator="#tools_btn" open-on-hover>
        <v-list density="compact">
          <v-list-item
            v-for="(item, index) in toolSelector.list"
            :key="index"
            :prepend-icon="item.icon"
            @click="selectTool(index)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            prepend-icon="article"
            @click="docDialogCtl.dialog = true"
          >
            Documents
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <DocumentsManage
      :send-message="sendMessage"
      :control="docDialogCtl"
      ref="documentMan"
    />
  </div>
</template>

<style lang="less">
.custom-add-btn {
  width: 50px;
  height: 50px;
  margin-left: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 10px #0000000d;
}

.v-theme--NewDark {
  .userinputmsg {
    .v-field__overlay {
      background-color: #363e49;
    }
  }

  .custom-add-btn {
    background-color: #59667b !important;
    border: none !important;

    .btn-icon {
      color: #fff;
    }
  }

  .regenerate-btn {
    border: 1px solid #46505e;
  }
}

.v-theme--light {
  .userinputmsg {
    .v-field__overlay {
      background-color: #fff;
    }
  }

  .custom-add-btn {
    background-color: #fff !important;
    border: 1px solid #e9e9e9 !important;

    .btn-icon {
      color: #757585;
    }
  }

  .regenerate-btn {
    border: 1px solid #fff;
  }
}

.userinputmsg {
  border-radius: 8px;

  .v-field {
    border-radius: 8px !important;
    --v-textarea-control-height: 70px !important;
    --v-field-padding-start: 24px;
    --v-field-padding-end: 24px;
    --v-field-padding-top: 9px;
    --v-field-padding-bottom: 24px;
  }
}

.regenerate-btn {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
}

.footer-wrapper {
  position: relative;
}
</style>
