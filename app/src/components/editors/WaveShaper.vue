<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> WaveShaper </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <Dropdown :label="`Oversample ${param.oversample}`" :items="sampleTypes.map((type) => ({ value: type, label: type }))" :selected="param.oversample" :on-select="(v) => onUpdate('oversample', v as OverSampleType)" />
    </div>
    <div>
      <Dropdown
        :label="`Curve`" :items="curveTypes.map((type) => ({ value: type, label: type }))" :selected="param.curveType" :on-select="(v) => onUpdate('curveType', v as CurveType)" />
    </div>
    <div>
      <RangeSlider
        :step="param.amount.step"
        :min="param.amount.min"
        :max="param.amount.max"
        :on-change="(value) => onUpdate('amount', { ...param.amount, ...value }) "
        :value="param.amount.value"
        :label="`Amount`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import Dropdown from '../Dropdown.vue';
import RangeSlider from '../RangeSlider.vue';
import { OnUpdateParam } from './types';
import { UpdateWaveShaperEvent, UpdateModuleEvent, WaveShaper, CurveType } from '../../hooks/types';

const sampleTypes: OverSampleType[] = [
  '2x',
  '4x',
  'none',
]

const curveTypes: CurveType[] = [
  'none',
  'distortion',
  'fuzz',
  'overdrive',
  'sawtooth',
]

const props = defineProps<{
  item: WaveShaper,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();


const param = computed(() => props.item.param);
const onUpdate: OnUpdateParam<UpdateWaveShaperEvent> = (key, value) => {
  props.onChange({
    brand: 'wave_shaper',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateWaveShaperEvent)
}


</script>
