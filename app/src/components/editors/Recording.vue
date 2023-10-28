<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Recording </span>
      <ContainButton
        color="delete"
        @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <button
        :class="buttonClass"
        @click="() => onUpdate('isRecording', !item.param.isRecording)"
      >
      <img :src="icon" alt="icon">
  </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import { Recording, UpdateModuleEvent, UpdateRecordingEvent } from '../../hooks/types';
import RecordingIcon from '../../assets/icons/recording.svg'
import StopIcon from '../../assets/icons/stop.svg'
import { OnUpdateParam } from './types';

const props = defineProps<{
  item: Recording,
  onDelete: (id: string) => void,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const baseClass = 'w-16 h-16 rounded-full text-white flex justify-center items-center'

const buttonClass = computed(() => {
  return props.item.param.isRecording ? `${baseClass} bg-gray-500` : `${baseClass} bg-red-500`
})

const icon = computed(() => {
  return props.item.param.isRecording ? StopIcon : RecordingIcon
})

const onUpdate: OnUpdateParam<UpdateRecordingEvent> = (key, value) => {
  props.onChange({
    brand: 'recording',
    param: {
      ...props.item.param,
      [key]: value,
    },
    module: props.item,
  } as UpdateRecordingEvent)
}
</script>

