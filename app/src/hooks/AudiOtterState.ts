import { nanoid } from "nanoid";
import { InjectionKey, computed, reactive, readonly, ref } from "vue"
import { BiquadFilter, Delay, DestinationModule, Item, Link, LinkMap, AudiOtterState, MicIn, Module, SourceModule, SpeakerOut } from "./types";
import { useIntractiveTool } from "./intractive_tool";
import { connectModules, onDeleteLinkHandler } from "./module_updater";

const loadModules = async () => {
  const mediaStreamStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioContext = new AudioContext();

  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStreamStream);

  const speakerOut: SpeakerOut = {
    id: nanoid(),
    brand: 'speaker_out',
    position: {
      x: 200,
      y: 150,
    },
    destinationIds: [],
    destination: audioContext,
  }

  const lowpassFilter = audioContext.createBiquadFilter();
  lowpassFilter.type = 'lowpass';
  lowpassFilter.frequency.value = 300;
  lowpassFilter.Q.value = 1; 
  const quadFilter: BiquadFilter = {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: 250,
      y: 50,
    },
    destinationIds: [speakerOut.id],
    source: lowpassFilter,
  }

  const delay = audioContext.createDelay(10)
  delay.delayTime.value = 1
  const delayModule: Delay = {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: 150,
      y: 50,
    },
    destinationIds: [quadFilter.id],
    source: delay,
  }

  const micIn: MicIn = {
    id: nanoid(),
    brand: 'mic_in',
    position: {
      x: 50,
      y: 50,
    },
    destinationIds: [speakerOut.id, delayModule.id],
    source: mediaStreamSource,
  }
  return [micIn, speakerOut, quadFilter, delayModule];
}

const buildModuleAndLink = (modules: Module[]): LinkMap => {
  const linkMap = new Map();
  for (const destinationModule of modules) {
    connectModules(destinationModule, modules, linkMap);
  }
  return linkMap
}

const useAudiOtter = () => {
  const mutableState = reactive<AudiOtterState>({
    status: 'title',
    modules: [],
    linkMap: new Map(),
    selectedItems: [],
  });
  const { tool, changeTool, selectedPalette } = useIntractiveTool(mutableState)

  const init =  async () => {
    mutableState.status = 'loading';
    const modules = await loadModules();
    mutableState.linkMap = buildModuleAndLink(modules);
    mutableState.status = 'running';
    mutableState.modules = modules;
  }

  return {
    state: readonly(mutableState),
    selectedItem: computed<Item | undefined>(() => {
      return  mutableState.modules.find((module) => module.id === mutableState.selectedItems[0]) ||
        mutableState.linkMap.get(mutableState.selectedItems[0]);
    }),
    onDeleteLink: onDeleteLinkHandler(mutableState),
    tool,
    init,
    selectedPalette,
    changeTool,
  }
};

export type AudiOtterComposition = ReturnType<typeof useAudiOtter>;
export const lynreSynthKey = Symbol('lynreSynth') as InjectionKey<AudiOtterComposition>;
export default useAudiOtter;
