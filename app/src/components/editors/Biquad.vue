<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Biquad filter </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <Dropdown :label="`Type ${param.type}`" :items="filterTypes.map((type) => ({ value: type, label: type }))" :selected="param.type" :on-select="(v) => onUpdate('type', v as BiquadFilterType)" />
    </div>
    <div>
      <RangeSlider :step="1" :min="-400" :max="400" :on-change="(n) => onUpdate('gain', n) " :value="param.gain" :label="`Gain ${param.gain}`" />
    </div>
    <div>
      <RangeSlider :step="1" :min="10" :max="5000" :on-change="(n) => onUpdate('frequency', n) " :value="param.frequency" :label="`Frequency ${param.frequency}`" />
    </div>
    <div>
      <RangeSlider :step="0.01" :min="0.01" :max="10" :on-change="(n) => onUpdate('Q', n) " :value="param.Q" :label="`Q factor ${param.Q}`" />
    </div>
    <div>
      <RangeSlider :step="1" :min="-100" :max="100" :on-change="(n) => onUpdate('detune', n) " :value="param.detune" :label="`Detune ${param.detune}`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import Dropdown from '../Dropdown.vue';
import useConnectableModuleEditor from './hooks';
import { BiquadFilter, UpdateModuleEvent } from '../../hooks/types';

const filterTypes: BiquadFilterType[] = [
  'lowpass',
  'highpass',
  'bandpass',
  'lowshelf',
  'highshelf',
  'peaking',
  'notch',
  'allpass',
]

const props = defineProps<{
  item: BiquadFilter,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const { param, onUpdate } = useConnectableModuleEditor({
  brand: 'biquad_filter',
  module: props.item,
  param: props.item.param,
}, props.onChange);

</script>
