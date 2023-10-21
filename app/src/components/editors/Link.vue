<template>
  <div class="w-full">
    <div class="mb-4 flex justify-between">
      <span class=" text-gray-100 text-2xl"> Cable </span>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
    <div>
      <Dropdown
        label="Connect to"
        :items="selectableDestinations"
        :selected="selectedDestination"
        :onSelect="onSelect"
      ></Dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { DeepReadonly, PropType, computed, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import Dropdown, { SelectItem } from '../Dropdown.vue';
import { Link, Module } from '../../hooks/types';
import { AudiOtterComposition } from '../../hooks/AudiOtterState';
import { isConnectableModule } from '../../hooks/module_updater';

const props = defineProps({
  item: {
    type: Object as PropType<Link>,
    required: true
  },
  modules: {
    type: Array as PropType<DeepReadonly<Module[]>>,
    required: true
  },
  onDelete: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  },
  onChangeDestination: {
    type: Function as PropType<AudiOtterComposition['onChangeModuleDestination']>,
    required: true,
  }
})

const onSelect = (value: string) => {
  const src = source.value as Module | undefined;
  if (isConnectableModule(src) && destination.value) {
    if (value === 'node') {
      props.onChangeDestination(src.id, {
        id: destination.value.id,
        target: 'node',
      })
    } else {
      props.onChangeDestination(src.id, {
        id: destination.value.id,
        target: 'param',
        paramKey: value,
      })
    }
    
  }
}

const source = computed(() => {
  return props.modules.find((m) => m.id === props.item.sourceId);
})
const destination = computed(() => {
  return props.modules.find((m) => m.id === props.item.destinationId);
})
const selectedDestination = computed(() => {
  const src = source.value;
  const des = destination.value
  const info = src?.destinations.find((i) => i.id === des?.id);
  return info?.target === 'param' ? info.paramKey : 'node'
})

const selectableDestinations = computed(() => {
  const src = source.value;
  const des = destination.value as Module
  const destinationInfo = src?.destinations.find((i) => i.id === des?.id);

  if (destinationInfo && des && source) {
    if (isConnectableModule(des)) {
      // fixme: this is a hack to get the audio param keys
      const node = des.source as any
      // find all audio params
      const list =  Object.getOwnPropertyNames(Object.getPrototypeOf(node))
        .filter((key) => {
          return node[key] instanceof AudioParam
        }) 
        .map<SelectItem>((paramKey) => {
          return {
            label: paramKey,
            value: paramKey,
          }
        })
      
      return [
        {
          label: 'Node',
          value: 'node',
        },
        ...list
      ]
    }
  }
  return []
})



</script>
