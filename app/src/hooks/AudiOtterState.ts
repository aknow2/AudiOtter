import { nanoid } from "nanoid";
import { InjectionKey, computed, reactive, readonly} from "vue"
import { BiquadFilter, Delay, Item, AudiOtterState, MicIn, Module, SpeakerOut, Gain } from "./types";
import { useIntractiveTool } from "./intractive_tool";
import { changeDestination, connectModules, onDeleteLinkHandler, onDeleteModuleHandler } from "./module_updater";
import { loadModules, saveModules } from "./loader";

const loadSample = async (audioContext: AudioContext) => {
  const speakerOut: SpeakerOut = {
    id: nanoid(),
    brand: 'speaker_out',
    position: {
      x: 200,
      y: 300,
    },
    destinations: [],
  }

  const quadFilter: BiquadFilter = {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: 250,
      y: 200,
    },
    param: {
      frequency: 300,
      Q: 1,
      gain: 1,
      detune: 1,
      type: 'lowpass',
    },
    destinations: [{ target: 'node', id: speakerOut.id }],
  }

  const delayModule: Delay = {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: 150,
      y: 50,
    },
    param: {
      delayTime: 0.1,
      maxDelayTime: 10,
    },
    destinations: [{ target: 'node', id: quadFilter.id }],
  }

  const gain = audioContext.createGain();
  gain.gain.value = 0.1;
  const gainModule: Gain = {
    id: nanoid(),
    brand: 'gain',
    position: {
      x: 300,
      y: 100,
    },
    param: {
      gain: gain.gain.value,
    },
    destinations: [{ target: 'node', id: delayModule.id }],
  }
  quadFilter.destinations.push({ target: 'node', id: gainModule.id });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const micIn: MicIn = {
    id: nanoid(),
    brand: 'mic_in',
    position: {
      x: 50,
      y: 50,
    },
    param: { 
      stream,
    },
    destinations: [{ target: 'node', id: speakerOut.id }, { target: 'node', id: delayModule.id }],
  }

  return [micIn, speakerOut, quadFilter, delayModule, gainModule];
}


const storageKey = 'AudioOtterModules';
const initModules = async (audioContext: AudioContext): Promise<Module[]> => {

  const loadedModules = await loadModules(storageKey);
  if(loadedModules && loadedModules.length > 0) {
    return loadedModules;
  }

  return await loadSample(audioContext);
}

const connectModuleAndLink = (modules: Module[], state: AudiOtterState) => {
  for (const module of modules) {
    connectModules(module, state);
  }
}

const useAudiOtter = () => {
  window.addEventListener('beforeunload', (ev) => {

    saveModules(mutableState.modules, storageKey);
    ev.returnValue = 'Are you sure you want to close?';
  });


  const mutableState = reactive<AudiOtterState>({
    status: 'title',
    modules: [],
    linkMap: new Map(),
    selectedItems: [],
    webAudio: {
      context: new AudioContext(),
      node: new Map(),
    }
  });
  const { tool, changeTool, selectedPalette } = useIntractiveTool(mutableState)

  const init =  async () => {
    mutableState.status = 'loading';
    const modules = await initModules(mutableState.webAudio.context);
    mutableState.modules = modules;
    connectModuleAndLink(modules, mutableState);
    mutableState.status = 'running';
  }

  return {
    state: readonly(mutableState),
    getMutableState: () => mutableState,
    selectedItem: computed<Item | undefined>(() => {
      return  mutableState.modules.find((module) => module.id === mutableState.selectedItems[0]) ||
        mutableState.linkMap.get(mutableState.selectedItems[0]);
    }),
    onDeleteLink: onDeleteLinkHandler(mutableState),
    onDeleteModule: onDeleteModuleHandler(mutableState),
    onChangeModuleDestination: changeDestination(mutableState),
    tool,
    init,
    selectedPalette,
    changeTool,
  }
};

export type AudiOtterComposition = ReturnType<typeof useAudiOtter>;
export const audioOtterStateKey = Symbol('lynreSynth') as InjectionKey<AudiOtterComposition>;
export default useAudiOtter;
