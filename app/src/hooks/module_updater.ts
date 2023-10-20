import { nanoid } from "nanoid";
import { BiquadFilter, Delay, OutModule, Link, LinkMap, AudiOtterState, Module, ModuleBrand, ConnectableModule, SpeakerOut, UpdateModuleEvent, Gain } from "./types";

const isConnectableModule = (module: Module|undefined): module is ConnectableModule => {
  return module?.brand === 'mic_in' || module?.brand === 'biquad_filter' || module?.brand === 'delay' || module?.brand === 'gain';
}

const isOutModule = (module: Module|undefined): module is OutModule => {
  return module?.brand === 'speaker_out';
}

export const createLinkId = (srcModule: Module, desModule: Module) => `${srcModule.id}-${desModule.id}`

export const canCreateLink = (linkMap: LinkMap, srcModule: Module, desModule: Module, linkId: string): srcModule is ConnectableModule => {
  if (linkMap.has(linkId) || srcModule.id === desModule.id) {
    return false;
  }
  return isConnectableModule(srcModule)
}

export const createLink = (srcModule: ConnectableModule, desModule: Module, linkId: string): Link => {
  return {
    brand: 'link',
    id: linkId,
    sourceId: srcModule.id,
    destinationId: desModule.id,
  };
}

const connect = (srcModule: ConnectableModule, desModule: Module) => {
  if (isOutModule(desModule)) {
    srcModule.source.connect(desModule.destination.destination);
  } else {
    srcModule.source.connect(desModule.source);
  }
}

const findDesModules = (srcModule: Module, modules: Module[])=>
     modules.filter((module) => srcModule.destinationIds.find((id) => id === module.id));

export const connectModuleProcess = (srcModule: Module, desModule: Module, linkMap: Map<string, Link>) => {
  const linkId = createLinkId(srcModule, desModule);
  if (canCreateLink(linkMap, srcModule, desModule, linkId)) {
    const link = createLink(srcModule, desModule, linkId)
    linkMap.set(link.id, link)
    connect(srcModule, desModule)
  }
}

export const connectModules = (srcModule: Module, modules: Module[], linkMap: Map<string, Link>) => {
  const desModules = findDesModules(srcModule, modules);
  for (const desModule of desModules) {
    connectModuleProcess(srcModule, desModule, linkMap);
  }
}

const disconnect = (srcModule: ConnectableModule, desModule: Module) => {
  if (isConnectableModule(desModule)) {
    srcModule.source.disconnect(desModule.source)
  } else {
    srcModule.source.disconnect(desModule.destination.destination)
  }
}

interface CreateModuleParam {
  x: number;
  y: number;
  type: ModuleBrand
}
const createDelay = (audioContext: AudioContext, param: CreateModuleParam): Delay => {
  const delay = audioContext.createDelay(10)
  return {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: param.x,
      y: param.y,
    },
    destinationIds: [],
    source: delay,
  }
}

const createBiquadFilter = (audioContext: AudioContext, param: CreateModuleParam): BiquadFilter => {
  const filter = audioContext.createBiquadFilter();

  return {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: param.x,
      y: param.y,
    },
    destinationIds: [],
    source: filter,
  }
}

const createGainModule = (audioContext: AudioContext, param: CreateModuleParam): Gain => {
  const gain = audioContext.createGain();
  return {
    id: nanoid(),
    brand: 'gain',
    position: {
      x: param.x,
      y: param.y,
    },
    destinationIds: [],
    source: gain,
  }
}


const updateConnectableModule = ({ brand, module, param }: UpdateModuleEvent) => {
  switch (brand) {
    case 'delay':
      module.source.delayTime.value = param.delayTime;
      break;
    case 'biquad_filter':
      module.source.type = param.type;
      module.source.frequency.value = param.frequency;
      module.source.Q.value = param.Q;
      module.source.gain.value = param.gain;
      break;
    case 'gain':
      module.source.gain.value = param.gain;
      break;
    default:
      throw new Error('not support')
  }
}

const createModule = (param: CreateModuleParam, audioContext: AudioContext): Module => {
  switch (param.type) {
    case 'delay':
      return createDelay(audioContext, param);
    case 'biquad_filter':
      return createBiquadFilter(audioContext, param);
    case 'gain':
      return createGainModule(audioContext, param);
    default:
      throw new Error('not support')
  }
}

export const createModuleUpdater = (state: AudiOtterState) => (ev: UpdateModuleEvent) => {
  const { module } = ev;
  updateConnectableModule(ev);
  state.modules = state.modules.map((m) => {
    if (m.id === module.id) {
      return module;
    }
    return m;
  })
}

export const createModuleCreator = (state: AudiOtterState) => (param: CreateModuleParam) => {
  const { destination: audioContext } = state.modules.find((module) => module.brand === 'speaker_out') as SpeakerOut;
  const module = createModule(param, audioContext);
  state.modules = [...state.modules, module];
}

export const onDeleteModuleHandler = (state: AudiOtterState) => (moduleId: string) => {
  const deleteModule = state.modules.find((m) => m.id === moduleId);
  if (isConnectableModule(deleteModule)) {
    Array.from(state.linkMap)
      .filter(([_, l]) => l.sourceId === moduleId || l.destinationId === moduleId)
      .forEach(([_, l]) => deleteLink(state, l))
    state.modules = state.modules.filter((m) => m.id !== deleteModule.id)
    state.selectedItems = []
  }
}

const deleteLink = (state: AudiOtterState, deleteLink: Link) => {
  const srcModule = state.modules.find((module) => module.id === deleteLink?.sourceId);
  const desModule = state.modules.find((module) => module.id === deleteLink?.destinationId);
  if (isConnectableModule(srcModule) && desModule) {
    srcModule.destinationIds = srcModule.destinationIds.filter((id) => id !== deleteLink?.destinationId);
    disconnect(srcModule, desModule)
    state.linkMap.delete(deleteLink.id);
  }
  state.linkMap = new Map(state.linkMap);
  state.selectedItems = []
}

export const onDeleteLinkHandler = (state: AudiOtterState) => (linkId: string) => {
  const link = state.linkMap.get(linkId);
  if (link) {
    deleteLink(state, link);
  }
};
