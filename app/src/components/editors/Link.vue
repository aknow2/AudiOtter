<template>
  <div class="w-full">
    <div class="mb-4">
      <span class=" text-gray-100 text-2xl"> Cable </span>
    </div>
    <div>
      <ContainButton color="delete" @click="() => props.onDelete(props.item.id)" > Delete </ContainButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, defineProps } from 'vue'
import ContainButton from '../ContainButton.vue';
import { Link } from '../../hooks/types';

const props = defineProps({
  item: {
    type: Object as PropType<Link>,
    required: true
  },
  onDelete: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  }
})

</script>
