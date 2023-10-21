<template>
  <canvas id="pixi"></canvas>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, inject } from 'vue';
import createWorkspace, { Workspace } from '../space/workspace';
import { audioOtterStateKey } from '../hooks/AudiOtterState';
  const workspace = ref<Workspace|null>(null)

  const audiOtter = inject(audioOtterStateKey)
  onMounted(() => {
    const canvas: HTMLCanvasElement = document.querySelector('#pixi') as HTMLCanvasElement
    workspace.value = createWorkspace(canvas)
    workspace.value?.update(audiOtter!)
  })

  watch([
    () => audiOtter!.state.modules,
    () => audiOtter!.state.linkMap,
    () => audiOtter!.state.selectedItems,
    () => audiOtter!.state.feedBack,
    () => audiOtter!.selectedPalette.value,
  ],
  () => {
    const space = workspace.value
    if (space) {
      space.update(audiOtter!)
    }
  })
</script>