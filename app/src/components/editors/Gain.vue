<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Gain </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <RangeSlider
        :step="item.param.gain.step"
        :min="item.param.gain.min"
        :max="item.param.gain.max"
        :on-change="(value) => onUpdate('gain', { ...item.param.gain, ...value }) "
        :value="item.param.gain.value"
        :label="`Gain`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import { OnUpdateParam } from './types';
import { Gain, UpdateGainEvent, UpdateModuleEvent } from '../../hooks/types';

const props = defineProps<{
  item: Gain,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const onUpdate: OnUpdateParam<UpdateGainEvent> = (key, value) => {
  props.onChange({
    brand: 'gain',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateGainEvent)
}

</script>


