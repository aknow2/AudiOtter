<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Delay </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <RangeSlider :step="0.1" :min="0.1" :max="10" :on-change="(n) => onUpdate('delayTime', n) " :value="param.delayTime" :label="`Delay time ${param.delayTime}`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import useSourceModuleEditor from './composition';
import { Delay, UpdateModuleEvent } from '../../hooks/types';

const props = defineProps<{
  item: Delay,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const { param, onUpdate } = useSourceModuleEditor({
  brand: 'delay',
  module: props.item,
  param: {
    delayTime: props.item.source.delayTime.value,
    maxDelayTime: 10, // Read only property
  }
}, props.onChange);

</script>

