<template>
  <!--Palette Square button-->
  <button :class="buttonClass + ' w-16 h-16'">
    <slot></slot>
  </button>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'

const baseBtnClass = 'palette-item bg-blue-500 active:bg-blue-700 text-white py-2 px-4 border-b-4 border-blue-700 rounded flex justify-center items-center flex-col'
const selectedBtnClass = baseBtnClass + '  translate-y-0.5  bg-blue-800'
const props = defineProps({
  pressed: {
    type: Boolean,
    default: false,
  }
})

const buttonClass = computed(() => {
  const selected = props.pressed ? 'selected' : ''
  return selected ? selectedBtnClass : baseBtnClass
})

</script>
<style scoped>
.palette-item {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

</style>