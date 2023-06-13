<template>
  <div class="welcome-container">
    <div class="text-center mt-16 mt-sm-7">
      <CustomTab />
    </div>
    <div class="greeting px-4 px-sm-0">
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
