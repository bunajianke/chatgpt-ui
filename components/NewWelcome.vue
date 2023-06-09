<template>
  <div class="welcome-container">
    <div class="pa-5 text-center">
      <CustomTab />
    </div>
    <div class="greeting">
      <p class="welcome-text">
        ChatPanda - {{ currentModel.name.toUpperCase() }}
      </p>
    </div>
  </div>
</template>

<script setup>
const currentModel = useCurrentModel();
</script>

<style lang="less">
.welcome-container {
  height: calc(100% - var(--v-layout-top));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .greeting {
    flex: 1;
    display: flex;
    align-items: center;
  }
}
.welcome-text {
  font-size: 40px;
  color: #d9d9e3;
  text-align: center;
}
</style>
