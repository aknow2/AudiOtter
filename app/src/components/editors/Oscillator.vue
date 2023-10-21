<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl bg-"> Oscillator </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <PlayBtn color="cyan" :pressed="props.item.isPlaying" @click="() => onUpdate('isPlaying', !item.isPlaying)">
        Play
      </PlayBtn>
    </div>
    <div>
      <Dropdown :label="`Type ${param.type}`" :items="oscTypes.map((type) => ({ value: type, label: type }))" :selected="param.type" :on-select="(v) => onUpdate('type', v as OscillatorType)" />
    </div>
    <div>
      <RangeSlider :step="1" :min="0" :max="7000" :on-change="(n) => onUpdate('frequency', n) " :value="param.frequency"
          :label="`Frequency ${param.frequency}`" />
    </div>
    <div>
      <RangeSlider :step="1" :min="-100" :max="100" :on-change="(n) => onUpdate('detune', n) " :value="param.detune"
            :label="`Detune ${param.detune}`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import Dropdown from '../Dropdown.vue';
import useConnectableModuleEditor from './hooks';
import PlayBtn from '../Palettes/PaletteItem.vue';
import { Oscillator, UpdateModuleEvent } from '../../hooks/types';

const oscTypes: OscillatorType[] = [
  'sine',
  'square',
  'sawtooth',
  'triangle',
]

const props = defineProps<{
  item: Oscillator,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const { param, onUpdate } = useConnectableModuleEditor({
  brand: 'oscillator',
  module: props.item,
  param: {
    type: props.item.source.type,
    frequency: props.item.source.frequency.value,
    detune: props.item.source.detune.value,
    isPlaying: props.item.isPlaying,
  }
}, props.onChange);

</script>


