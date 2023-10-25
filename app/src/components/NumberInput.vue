<template>
  <div class="relative flex ml-3">
    <div class="text-white text-sm absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none border-r-2">
        {{ label }}
    </div>
    <input
      type="number"
      class="block w-full pl-10 text-sm rounded-lg bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
      required
      :value="value"
      @input="onInputValue"
    >
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  value: number,
  label: string,
  onChange: (v: number) => void
}

const props = defineProps<Props>()
const onInputValue = (ev: Event) => {
  const target = ev.target as HTMLInputElement
  const value = Number(target.value) 
  if (!isNaN(value) && isFinite(value)) {
    props.onChange(value)
  }
}
</script>
