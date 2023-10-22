import { nanoid } from "nanoid";
import { BiquadFilter, Delay, OutModule, Link, LinkMap, AudiOtterState, Module, ModuleBrand, ConnectableModule, SpeakerOut, UpdateModuleEvent, Gain, Oscillator, DestinationInfo } from "./types";

export const isConnectableModule = (module: Module|undefined): module is ConnectableModule => {
  return module?.brand === 'mic_in'
    || module?.brand === 'biquad_filter'
    || module?.brand === 'delay'
    || module?.brand === 'gain'
    || module?.brand === 'oscillator';
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
const getDestination = (node: AudioNode, desInfo: DestinationInfo) => {
  if (desInfo.target === 'node') {
    return node;
  }
  // fix me: Using Any, Not typesafe and it's not cool.
  return (node as any)[desInfo.paramKey] as any;
}

const connect = (srcModule: ConnectableModule, desModule: Module, desInfo: DestinationInfo) => {
  if (isOutModule(desModule)) {
    srcModule.source.connect(getDestination(desModule.context.destination, desInfo));
  } else {
    const des =  getDestination(desModule.source, desInfo)
    srcModule.source.connect(des);
  }
}

const disconnect = (srcModule: ConnectableModule, desModule: Module, desInfo: DestinationInfo) => {
  if (isConnectableModule(desModule)) {
    srcModule.source.disconnect(getDestination(desModule.source, desInfo))
  } else {
    srcModule.source.disconnect(getDestination(desModule.context.destination, desInfo))
  }
}

export const connectModuleProcess = (srcModule: Module, desModule: Module, destination: DestinationInfo, linkMap: Map<string, Link>) => {
  const linkId = createLinkId(srcModule, desModule);
  if (canCreateLink(linkMap, srcModule, desModule, linkId)) {
    const link = createLink(srcModule, desModule, linkId)
    linkMap.set(link.id, link)
    connect(srcModule, desModule, destination)
  }
}

export const connectModules = (srcModule: Module, modules: Module[], linkMap: Map<string, Link>) => {
  srcModule.destinations.forEach((destination) => {
    const desModule = modules.find((m) => m.id === destination.id);
    if (desModule) {
      connectModuleProcess(srcModule, desModule, destination, linkMap);
    }
  })
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
    destinations: [],
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
    destinations: [],
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
    destinations: [],
    source: gain,
  }
}

const createOscillator = (audioContext: AudioContext, param: CreateModuleParam): Oscillator => {
  const oscillator = audioContext.createOscillator();
  return {
    id: nanoid(),
    brand: 'oscillator',
    position: {
      x: param.x,
      y: param.y,
    },
    isPlaying: false,
    destinations: [],
    source: oscillator,
  }
}


const updateConnectableModule = ({ brand, module, param }: UpdateModuleEvent, state: AudiOtterState) => {
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
    case 'oscillator':
      if (module.isPlaying === param.isPlaying) {
        module.source.type = param.type;
        module.source.frequency.value = param.frequency;
        module.source.detune.value = param.detune;
        return;
      }
      module.isPlaying = param.isPlaying;
      if (param.isPlaying) {
        module.source.start();
      } else {
        module.source.stop();
        module.source = module.source.context.createOscillator();
        const destinations = state
          .modules
          .reduce<[Module, DestinationInfo][]>((acc, m) => {
            const des = module.destinations.find((d) => d.id === m.id)

            if (des) {
              acc.push([m, des]);
            }
            return acc;
          }, []);
        destinations.forEach(([desModule, des]) => {
          connect(module, desModule, des);
        });
        module.source.type = param.type;
        module.source.frequency.value = param.frequency;
        module.source.detune.value = param.detune;
      }
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
    case 'oscillator':
      return createOscillator(audioContext, param);
    default:
      throw new Error('not support')
  }
}

export const createModuleUpdater = (state: AudiOtterState) => (ev: UpdateModuleEvent) => {
  const { module } = ev;
  updateConnectableModule(ev, state);
  state.modules = state.modules.map((m) => {
    if (m.id === module.id) {
      return module;
    }
    return m;
  })
}

export const createModuleCreator = (state: AudiOtterState) => (param: CreateModuleParam) => {
  const { context: audioContext } = state.modules.find((module) => module.brand === 'speaker_out') as SpeakerOut;
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
    const desInfo = srcModule.destinations.find((d) => d.id === deleteLink.destinationId)
    if (!desInfo) {
      throw new Error('Not found destination info in src module');
    }
    disconnect(srcModule, desModule, desInfo!)
    srcModule.destinations = srcModule.destinations.filter((d) => d.id !== deleteLink?.destinationId);
    state.linkMap.delete(deleteLink.id);
  }
  state.linkMap = new Map(state.linkMap);
  state.selectedItems = []
}

export const changeDestination = (state: AudiOtterState) => (moduleId: string, desInfo: DestinationInfo) => {
  const module = state.modules.find((m) => m.id === moduleId)
  const oldInfo = module?.destinations.find((d) => d.id === desInfo.id);
  const desModule = state.modules.find((m) => m.id === desInfo.id);
  if (!isConnectableModule(module) || !oldInfo || !desModule) {
    throw new Error('Not found' + module + oldInfo + desModule)
  }

  disconnect(module, desModule, oldInfo);
  connect(module, desModule, desInfo);

  module.destinations = module.destinations.map((d) => {
    if (d.id === desInfo.id) {
      return desInfo
    }
    return d
  });
}

export const onDeleteLinkHandler = (state: AudiOtterState) => (linkId: string) => {
  const link = state.linkMap.get(linkId);
  if (link) {
    deleteLink(state, link);
  }
};
