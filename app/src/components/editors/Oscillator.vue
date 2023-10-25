<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl bg-"> Oscillator </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <PlayBtn color="cyan" :pressed="props.item.param.isPlaying" @click="() => onUpdate('isPlaying', !item.param.isPlaying)">
        Play
      </PlayBtn>
    </div>
    <div>
      <Dropdown :label="`Type`" :items="oscTypes.map((type) => ({ value: type, label: type }))" :selected="param.type" :on-select="(v) => onUpdate('type', v as OscillatorType)" />
    </div>
    <div>
      <RangeSlider
        :step="param.frequency.step"
        :min="param.frequency.min"
        :max="param.frequency.max"
        :on-change="(value) => onUpdate('frequency', { ...param.frequency, ...value }) "
        :value="param.frequency.value"
        :label="`Frequency`" />
    </div>
    <div>
      <RangeSlider
        :step="param.detune.step"
        :min="param.detune.min"
        :max="param.detune.max"
        :on-change="(value) => onUpdate('detune', { ...param.detune, ...value }) "
        :value="param.detune.value"
        :label="`Detune`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import Dropdown from '../Dropdown.vue';
import PlayBtn from '../Palettes/PaletteItem.vue';
import { Oscillator, UpdateModuleEvent, UpdateOscillatorEvent } from '../../hooks/types';
import { OnUpdateParam } from './types';

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

const param = computed(() => props.item.param);

const onUpdate: OnUpdateParam<UpdateOscillatorEvent> = (key, value) => {
  props.onChange({
    brand: 'oscillator',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateOscillatorEvent)
}

</script>


