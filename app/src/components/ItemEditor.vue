<template>
  <div class="fixed bottom-0 flex justify-center w-full">
    <div class="w-10/12 rounded bg-teal-700 p-4 h-52" >
      <template v-if="selectedItem?.brand === 'link'">
        <LinkEditor :item="selectedItem" :on-delete="onDeleteLink" />
      </template>
      <template v-else>
        <Palette />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject } from 'vue';
import { AudiOtterComposition, lynreSynthKey } from '../hooks/AudiOtterState';
import LinkEditor from './editors/Link.vue';
import Palette from './Palette.vue';

const { selectedItem, onDeleteLink } = inject(lynreSynthKey) as AudiOtterComposition

</script>