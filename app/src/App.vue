<template>
  <div class="h-screen w-screen bg-orange-100">
    <template v-if="state.status === 'title'">
      <div class="flex h-full w-full justify-center">
        <div class="flex items-center justify-center flex-col">
          <h1 class="text-6xl mb-8 text-gray-500 font-bold">AudiOtter</h1>
          <button
            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full w-40 h-40 text-3xl"
            @click="init"
          >
            Play
          </button>
          <h2 class="text-2xl text-gray-500 mt-8">WebAudioApi drawing tool</h2>
        </div>
      </div>
    </template>
    <template v-if="state.status === 'running'">
      <Workspace />
      <ItemEditor />
    </template>
  </div>
</template>
<script setup lang="ts">
import { provide } from 'vue';
import ItemEditor from './components/ItemEditor.vue';
import Workspace from './components/Workspace.vue';
import useAudiOtter, { lynreSynthKey } from './hooks/AudiOtterState';

const lynreSynth = useAudiOtter();
const { state, init } = lynreSynth;

provide(lynreSynthKey, lynreSynth);
</script>
