<template>
  <div class="tab-wrapper">
    <v-menu
      v-for="(item, index) in availableModels"
      :key="item"
      open-on-hover
      :location="setMenuLocation(index)"
    >
      <template #activator="{ props }">
        <div
          v-bind="props"
          :class="['tab-item', isCurrent(item) && 'current']"
          @click="currentModel.name = item"
        >
          <SvgIcon
            :name="iconMap[item].name"
            :color="
              isCurrent(item)
                ? iconMap[item]['activeColor']
                : iconMap[item]['color']
            "
          />
          <span class="ml-2">{{ item.toUpperCase() }}</span>
        </div>
      </template>

      <div class="introduction-card">
        <p class="title">{{ iconMap[item].title }}</p>
        <p class="desc">{{ iconMap[item].intro }}</p>
      </div>
    </v-menu>
  </div>
</template>

<script setup>
const currentModel = useCurrentModel();
const availableModels = [...AVAIlABLEMODELS];
const iconMap = { ...GPT_VERSION };
const isCurrent = (name) => {
  return currentModel.value.name === name;
};

const setMenuLocation = (index) => {
  if (index === 0) {
    return "bottom left";
  } else if (index === availableModels.length - 1) {
    return "bottom right";
  }
  return "bottom center";
};
</script>

<style lang="less">
.tab-wrapper {
  border-radius: 10px;
  background-color: #ececf1;
  padding: 5px;
  display: inline-flex;
  width: 100%;

  .tab-item {
    border-radius: 6px;
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 20px;
    white-space: nowrap;
    text-align: center;
    font-size: 15px;
    color: #8e8ea1;
    cursor: pointer;
    user-select: none;
  }

  .tab-item.current {
    background-color: #fff;
    color: #202123;
  }
}

.introduction-card {
  border-radius: 10px;
  padding: 16px;
  max-width: 300px;
  border: 1px solid #e5e5e5;
  margin-top: 14px;

  .title {
    font-size: 13px;
    color: #202123;
    font-weight: 400;
  }

  .desc {
    margin-top: 8px;
    font-size: 12px;
    color: #8e8ea1;
  }
}

.v-theme--NewDark {
  .tab-wrapper {
    background-color: #1f2329;
    .tab-item.current {
      background-color: #363e49;
      color: #fff;
    }
  }

  .introduction-card {
    border-color: #1f2329;
    background-color: #1f2329;
    .title {
      color: #fff;
    }
    .desc {
      color: #a8afb8;
    }
  }
}
</style>
