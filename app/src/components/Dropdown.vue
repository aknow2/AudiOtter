<template>
  <label for="countries" class="block mb-2 text-sm font-medium text-white">{{ props.label }}</label>
  <select @change="onChange" id="countries" class=" bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 text-sm rounded-lg block w-full p-2.5">
    <template v-for="item in props.items">
      <option :value="item.value" :selected="item.value === props.selected" >{{ item.label }}</option>
    </template>
  </select>
</template>
<script lang="ts" setup>
interface SelectItem {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  items: SelectItem[];
  selected: string;
  onSelect: (value: string) => void;
}

const onChange = (ev: Event) => {
  const target = ev.target as HTMLSelectElement;
  props.onSelect(target.value);
}

const props = defineProps<DropdownProps>();
</script>