<template>
  <svg
    :class="svgClass"
    v-bind="$attrs"
    :color="color"
    :style="{
      width,
      height,
    }"
  >
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "",
  },
  height: {
    type: [String, Number],
    default: "1em",
  },
  width: {
    type: [String, Number],
    default: "1em",
  },
});

const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => {
  if (props.name) {
    return `svg-icon icon-${props.name}`;
  }
  return "svg-icon";
});
</script>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.15em;
}
</style>
