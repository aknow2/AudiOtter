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
      <RangeSlider
        :step="param.frequency.step"
        :min="item.param.frequency.min"
        :max="param.frequency.max"
        :on-change="(value) => onUpdate('frequency', { ...param.frequency, value }) "
        :value="param.frequency.value"
        :label="`Frequency ${param.frequency.value}`"
      />
    </div>
    <div>
      <RangeSlider
        :step="param.Q.step"
        :min="param.Q.min"
        :max="param.Q.max"
        :on-change="value => onUpdate('Q', { ...param.Q, value }) "
        :value="param.Q.value"
        :label="`Q factor ${param.Q.value}`"
      />
    </div>
    <div>
      <RangeSlider
        :step="param.detune.step"
        :min="param.detune.min"
        :max="param.detune.max"
        :on-change="(value) => onUpdate('detune', { ...param.detune, value })"
        :value="param.detune.value"
        :label="`Detune ${param.detune.value}`"
      />
    </div>
    <div>
      <RangeSlider
        :step="param.gain.step"
        :min="param.gain.min"
        :max="param.gain.max"
        :on-change="(value) => onUpdate('gain', {...param.gain, value}) "
        :value="param.gain.value"
        :label="`Gain ${param.gain.value}`"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import Dropdown from '../Dropdown.vue';
import { OnUpdateParam } from './types';
import { BiquadFilter, UpdateBiquadFilterEvent, UpdateModuleEvent } from '../../hooks/types';

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


const param = computed(() => props.item.param);
const onUpdate: OnUpdateParam<UpdateBiquadFilterEvent> = (key, value) => {
  props.onChange({
    brand: 'biquad_filter',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateBiquadFilterEvent)
}


</script>
