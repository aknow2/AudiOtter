<template>
  <div class="text-gray-500 font-bold flex gap-3 flex-wrap">
    <template v-for="item in items">
      <PaletteItem @click="item.onClick" :pressed="item.pressed">
        <img :src="item.icon">
        <span class="text-xs">
          {{ item.label }}
        </span>
      </PaletteItem>
    </template>
  </div>
</template>
<script lang="ts" setup>
import PaletteItem from './Palettes/PaletteItem.vue'
import { computed, inject } from 'vue';
import { AudiOtterComposition, audioOtterStateKey } from '../hooks/AudiOtterState';
import CableIcon from '../assets/icons/cable.svg'
import DelayIcon from '../assets/icons/delay.svg'
import BiquadIcon from '../assets/icons/biquad.svg'
import GainIcon from '../assets/icons/gain.svg'
import OscillatorIcon from '../assets/icons/oscillator.svg'
import WaveShaperIcon from '../assets/icons/wave_shaper.svg'
import ConvolverIcon from '../assets/icons/convolver.svg'
import RecordingIcon from '../assets/icons/recording.svg'
import { CreateToolParam } from '../hooks/intractive_tool';

const { selectedPalette, changeTool } = inject(audioOtterStateKey) as AudiOtterComposition

const createPatteItemData = (param:  CreateToolParam) => {
  const selected = selectedPalette.value === param.type

  const defaultToolParam: CreateToolParam = {
    type: 'default'
  }
  switch(param.type) {
    case 'cable':
      return {
        icon: CableIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Cable',
        pressed: selected
      }
    case 'delay':
      return {
        icon: DelayIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Delay',
        pressed: selected
      }
    case 'biquad_filter':
      return {
        icon: BiquadIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Biquad',
        pressed: selected
      }
    case 'gain': 
      return {
        icon: GainIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Gain',
        pressed: selected
      }
    case 'oscillator': 
      return {
        icon: OscillatorIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Osc.',
        pressed: selected
      }
    case 'wave_shaper': 
      return {
        icon: WaveShaperIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Shaper',
        pressed: selected
      }
    case 'convolver':
      return {
        icon: ConvolverIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Conv.',
        pressed: selected
      }
    case 'recording':
      return {
        icon: RecordingIcon,
        onClick: () => changeTool(selected ? defaultToolParam : param),
        label: 'Rec.',
        pressed: selected
      }
    default:
      throw new Error('invalid type')
  }
}

const items = computed(() => {
  return [
    createPatteItemData({ type: 'cable'}),
    createPatteItemData({ type: 'delay'}),
    createPatteItemData({ type: 'biquad_filter'}),
    createPatteItemData({ type: 'gain'}),
    createPatteItemData({ type: 'oscillator'}),
    createPatteItemData({ type: 'wave_shaper'}),
    createPatteItemData({ type: 'convolver'}),
    createPatteItemData({ type: 'recording'}),
  ]
})

</script>