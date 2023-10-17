<template>
  <!--Palette Square button-->
  <button :class="buttonClass + ' w-16 h-16'">
    <slot></slot>
  </button>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  pressed: {
    type: Boolean,
    default: false,
  }
})

const buttonClass = computed(() => {
  const selected = props.pressed ? 'selected' : ''
  return `palette-item bg-blue-500 active:bg-blue-700 text-white py-2 px-4 border-b-4 border-blue-700 rounded ${selected} flex justify-center items-center flex-col`
})

</script>
<style scoped>
.palette-item {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.selected {
  background-color: #1e40af;
  transform: translateY(2px);
  box-shadow: none;
}
</style>