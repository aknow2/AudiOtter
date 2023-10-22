<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Gain </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <RangeSlider :step="0.01" :min="0" :max="5" :on-change="(n) => onUpdate('gain', n) " :value="param.gain"
          :label="`Gain ${param.gain}`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import useConnectableModuleEditor from './hooks';
import { Gain, UpdateModuleEvent } from '../../hooks/types';

const props = defineProps<{
  item: Gain,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const { param, onUpdate } = useConnectableModuleEditor({
  brand: 'gain',
  module: props.item,
  param: props.item.param,
}, props.onChange);

</script>


