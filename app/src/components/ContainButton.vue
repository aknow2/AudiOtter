<template>
  <button :class="buttonClass"> <slot/> </button>
</template>
<script lang="ts" setup>
import { PropType, computed, defineProps } from 'vue'

const props = defineProps({
  color: {
    type: String as PropType<'delete' | 'normal'>,
    required: true
  }
})

const buttonClass = computed(() => {
  switch(props.color) {
    case 'delete':
      return 'text-white bg-rose-700 hover:bg-rose-800 focus:ring-4 focus:ring-rose-300 font-medium rounded-lg text-sm px-5 py-2 mr-2 mb-2 focus:outline-none'
    case 'normal':
      return 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 mr-2 mb-2 focus:outline-none'
  }
})
</script>