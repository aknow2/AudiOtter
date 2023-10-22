<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Delay </span>
      <ContainButton
        color="delete"
        @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <RangeSlider
        :step="param.delayTime.step"
        :min="param.delayTime.min"
        :max="param.delayTime.max"
        :on-change="(value) => onUpdate('delayTime', { ...param.delayTime, value }) "
        :value="param.delayTime.value"
        :label="`Delay time ${param.delayTime.value}`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import RangeSlider from '../RangeSlider.vue';
import { OnUpdateParam } from './types';
import { Delay, UpdateDelayEvent, UpdateModuleEvent } from '../../hooks/types';

const props = defineProps<{
  item: Delay,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const param = computed(() => props.item.param);

const onUpdate: OnUpdateParam<UpdateDelayEvent> = (key, value) => {
  props.onChange({
    brand: 'delay',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateDelayEvent)
}

</script>

