<template>
  <label :for="id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ props.label }}</label>
  <input :min="min" :max="max" :step="step" @input="change" :id="id" type="range" :value="props.value" class=" accent-orange-100 w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700">
</template>
<script lang="ts" setup>
import { nanoid } from 'nanoid';

const props = defineProps<{
  value: number,
  label: string,
  min: number,
  max: number,
  step: number,
  onChange: (v: number) => void
}>()

const change = (ev: Event) => {
  if (!(ev.target instanceof HTMLInputElement)) {
    return;
  }
  const num = Number(ev.target.value)
  if (isFinite(num) && !isNaN(num) ) {
    props.onChange(num) 
  }
}
const id = nanoid()
</script>