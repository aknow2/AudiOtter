<template>
  <div class="fixed bottom-0 flex justify-center w-full">
    <div class="w-10/12 rounded bg-teal-700 p-4 min-h-fit" >
      <template v-if="selectedItem?.brand === 'link'">
        <LinkEditor
          :item="selectedItem"
          :on-delete="onDeleteLink"
          :modules="state.modules"
          :on-change-destination="onChangeModuleDestination"
        />
      </template>
      <template v-else-if="selectedItem?.brand === 'biquad_filter'">
        <BiquadEditor :on-change="updateModuleEvent" :item="selectedItem" :on-delete="onDeleteModule" />
      </template>
      <template v-else-if="selectedItem?.brand === 'delay'">
        <Delay :on-change="updateModuleEvent" :item="selectedItem" :on-delete="onDeleteModule" />
      </template>
      <template v-else-if="selectedItem?.brand === 'gain'">
        <Gain :on-change="updateModuleEvent" :item="selectedItem" :on-delete="onDeleteModule" />
      </template>
      <template v-else-if="selectedItem?.brand === 'oscillator'">
        <Oscillator :on-change="updateModuleEvent" :item="selectedItem" :on-delete="onDeleteModule" />
      </template>
      <template v-else-if="selectedItem?.brand === 'wave_shaper'">
        <WaveShaper :on-change="updateModuleEvent" :item="selectedItem" :on-delete="onDeleteModule" />
      </template>
      <template v-else>
        <Palette />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject } from 'vue';
import { AudiOtterComposition, audioOtterStateKey } from '../hooks/AudiOtterState';
import { createModuleUpdater } from '../hooks/module_updater';
import LinkEditor from './editors/Link.vue';
import BiquadEditor from './editors/Biquad.vue';
import Palette from './Palette.vue';
import Delay from './editors/Delay.vue';
import Gain from './editors/Gain.vue';
import Oscillator from './editors/Oscillator.vue';
import WaveShaper from './editors/WaveShaper.vue';

const {
  selectedItem,
  onDeleteLink,
  onDeleteModule,
  getMutableState,
  state,
  onChangeModuleDestination
} = inject(audioOtterStateKey) as AudiOtterComposition
const updateModuleEvent = createModuleUpdater(getMutableState());


</script>