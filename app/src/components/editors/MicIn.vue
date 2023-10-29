<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Mic. </span>
    </div>
    <div>
      <Dropdown
        label="Audio input"
        :items="audioInputList.map((device) => ({ value: device.deviceId, label: device.label }))"
        :selected="param.mic"
        :on-select="onUpdate"
      ></Dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, onMounted, ref } from 'vue'
import Dropdown from '../Dropdown.vue';
import { ChangeAudioInputEvent, MicIn, UpdateModuleEvent } from '../../hooks/types';

const props = defineProps<{
  item: MicIn,
  onChange: (event: UpdateModuleEvent) => void,
}>();

const audioInputList = ref([] as MediaDeviceInfo[]);
const param = computed(() => props.item.param);

onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  audioInputList.value = devices.filter((device) => device.kind === 'audioinput');
})


const onUpdate  = (deviceId: string) => {
  props.onChange({
    brand: 'update_mic_in',
    audioInput: deviceId,
    module: props.item,
  } as ChangeAudioInputEvent)
}

</script>
