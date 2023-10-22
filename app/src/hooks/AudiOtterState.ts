import { nanoid } from "nanoid";
import { InjectionKey, computed, reactive, readonly} from "vue"
import { BiquadFilter, Delay, Item, LinkMap, AudiOtterState, MicIn, Module, SpeakerOut, Gain } from "./types";
import { useIntractiveTool } from "./intractive_tool";
import { changeDestination, connectModules, onDeleteLinkHandler, onDeleteModuleHandler } from "./module_updater";
import { loadModules, saveModules } from "./loader";

const loadSample = async (audioContext: AudioContext) => {
  const mediaStreamStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStreamStream);
  const speakerOut: SpeakerOut = {
    id: nanoid(),
    brand: 'speaker_out',
    position: {
      x: 200,
      y: 300,
    },
    destinations: [],
    context: audioContext,
  }

  const lowpassFilter = audioContext.createBiquadFilter();
  const quadFilter: BiquadFilter = {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: 250,
      y: 200,
    },
    destinations: [{ target: 'node', id: speakerOut.id }],
    source: lowpassFilter,
  }

  const delay = audioContext.createDelay(10)
  delay.delayTime.value = 0.5;
  const delayModule: Delay = {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: 150,
      y: 50,
    },
    destinations: [{ target: 'node', id: quadFilter.id }],
    source: delay,
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
    destinations: [{ target: 'node', id: delayModule.id }],
    source: gain,
  }
  quadFilter.destinations.push({ target: 'node', id: gainModule.id });

  const micIn: MicIn = {
    id: nanoid(),
    brand: 'mic_in',
    position: {
      x: 50,
      y: 50,
    },
    destinations: [{ target: 'node', id: speakerOut.id }, { target: 'node', id: delayModule.id }],
    source: mediaStreamSource,
  }

  return [micIn, speakerOut, quadFilter, delayModule, gainModule];
}


const storageKey = 'AudioOtterModules';
const initModules = async (): Promise<Module[]> => {
  const audioContext = new AudioContext();

  const loadedModules = await loadModules(storageKey, audioContext);

  if(loadedModules) {
    return loadedModules;
  }

  return await loadSample(audioContext);
}

const connectModuleAndLink = (modules: Module[]): LinkMap => {
  const linkMap = new Map();
  for (const outModule of modules) {
    connectModules(outModule, modules, linkMap);
  }
  return linkMap
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
  });
  const { tool, changeTool, selectedPalette } = useIntractiveTool(mutableState)

  const init =  async () => {
    mutableState.status = 'loading';
    const modules = await initModules();
    mutableState.linkMap = connectModuleAndLink(modules);
    mutableState.status = 'running';
    mutableState.modules = modules;
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
