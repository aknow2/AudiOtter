import { InjectionKey, computed, reactive, readonly} from "vue"
import { Item, AudiOtterState, Module } from "./types";
import { useIntractiveTool } from "./intractive_tool";
import { changeDestination, initModuleAndLink, onDeleteLinkHandler, onDeleteModuleHandler } from "./module_updater";
import { loadModules, saveModules } from "./loader";
import { loadSample } from "./sample_modules";


const storageKey = 'AudioOtterModules1';
const initModules = async (): Promise<Module[]> => {

  const loadedModules = await loadModules(storageKey);
  if(loadedModules && loadedModules.length > 0) {
    return loadedModules;
  }

  return await loadSample();
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
      context: null as any,
    }
  });
  const { tool, changeTool, selectedPalette } = useIntractiveTool(mutableState);
  const init =  async () => {
    console.log('init')
    mutableState.webAudio.context = new AudioContext();
    mutableState.webAudio.context.resume();
    mutableState.status = 'loading';
    const modules = await initModules();
    mutableState.modules = modules;
    initModuleAndLink(modules, mutableState);
    mutableState.status = 'running';
  };

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
