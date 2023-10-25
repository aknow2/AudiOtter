<template>
  <div class="mt-2 grid grid-cols-5">
    <label :for="id" class="block mb-2 text-sm font-medium text-white">{{ props.label }}</label>
    <NumberInput label="value" :value="props.value" :on-change="onChangeValue" />
    <NumberInput label="Min" :value="props.min" :on-change="onChangeMin" />
    <NumberInput label="Max" :value="props.max" :on-change="onChangeMax" />
    <NumberInput label="Step" :value="props.step" :on-change="onChangeStep" />
    
  </div>
  <input :min="min" :max="max" :step="step" @input="change" :id="id" type="range" :value="props.value" class=" accent-orange-100 w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700">
</template>
<script lang="ts" setup>
import { nanoid } from 'nanoid';
import NumberInput from './NumberInput.vue';
import { RangeSetting } from '../hooks/types'

const onChangeSetting = (key: keyof RangeSetting) => (value: number) => {
  props.onChange({ [key]: value })
}

const props = defineProps<{
  value: number,
  label: string,
  min: number,
  max: number,
  step: number,
  onChange: (ev: Partial<RangeSetting>) => void
}>()

const onChangeMin = onChangeSetting('min');
const onChangeMax = onChangeSetting('max');
const onChangeStep = onChangeSetting('step');
const onChangeValue = onChangeSetting('value');

const change = (ev: Event) => {
  if (!(ev.target instanceof HTMLInputElement)) {
    return;
  }
  const num = Number(ev.target.value)
  if (isFinite(num) && !isNaN(num) ) {
    onChangeValue(num)
  }
}
const id = nanoid()
</script>