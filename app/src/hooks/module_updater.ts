import { nanoid } from "nanoid";
import { BiquadFilter, Delay, OutModule, Link, LinkMap, AudiOtterState, Module, ModuleBrand, ConnectableModule, UpdateModuleEvent, Gain, Oscillator, DestinationInfo, NodeMap } from "./types";

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

const createNode = (module: ConnectableModule, context: AudioContext): AudioNode => {
  switch (module.brand) {
    case 'delay': {
      const node = new DelayNode(context, {
        delayTime: module.param.delayTime,
      });
      return node;
    }
    case 'biquad_filter': {
      const node = new BiquadFilterNode(context, {
        Q: module.param.Q,
        frequency: module.param.frequency,
        detune: module.param.detune,
        gain: module.param.gain,
        type: module.param.type,
      });
      return node;
    }
    case 'gain': {
      const node = new GainNode(context, {
        gain: module.param.gain,
      });
      return node;
    }
    case 'oscillator': {
      const node = new OscillatorNode(context, {
        type: module.param.type,
        frequency: module.param.frequency,
        detune: module.param.detune,
      });
      return node;
    }
    case "mic_in": {
      const node = context.createMediaStreamSource(module.param.stream);
      return node;
    }
  }
}

const getOrCreateNode = (module: ConnectableModule, context: AudioContext, nodeMap: NodeMap): AudioNode => {
  const node = nodeMap.get(module.id);
  if (node) {
    return node;
  }
  const newNode = createNode(module, context);
  nodeMap.set(module.id, newNode);
  return newNode;
}

const connect = (
  srcModule: ConnectableModule,
  desModule: Module,
  desInfo: DestinationInfo,
  context: AudioContext,
  nodeMap: NodeMap) => {
  
  const srcNode = getOrCreateNode(srcModule, context, nodeMap);
  if (isOutModule(desModule)) {
    srcNode.connect(getDestination(context.destination, desInfo));
  } else {
    const desNode = getOrCreateNode(desModule, context, nodeMap);
    const des =  getDestination(desNode, desInfo)
    srcNode.connect(des);
  }
}

const disconnect = (srcModule: ConnectableModule, desModule: Module, desInfo: DestinationInfo, context: AudioContext, nodeMap: NodeMap) => {
  const srcNode = nodeMap.get(srcModule.id);

  if (!srcNode) {
    throw new Error('Not found node in nodeMap');
  }

  if (isConnectableModule(desModule)) {
    const desNode = nodeMap.get(desModule.id);
    if (!desNode) {
      throw new Error('Not found node in nodeMap');
    }
    srcNode.disconnect(getDestination(desNode, desInfo))
  } else {
    srcNode.disconnect(getDestination(context.destination, desInfo))
  }
}

export const connectModuleProcess = (
  srcModule: Module,
  desModule: Module,
  destination: DestinationInfo,
  state: AudiOtterState) => {
  const linkId = createLinkId(srcModule, desModule);
  const { linkMap, webAudio: { context, node } } = state;
  if (canCreateLink(linkMap, srcModule, desModule, linkId)) {
    const link = createLink(srcModule, desModule, linkId)
    linkMap.set(link.id, link)
    connect(srcModule, desModule, destination, context, node);
  }
}

export const connectModules = (
  srcModule: Module,
  state: AudiOtterState,
) => {
  srcModule.destinations.forEach((destination) => {
    const desModule = state.modules.find((m) => m.id === destination.id);
    if (desModule) {
      connectModuleProcess(srcModule, desModule, destination, state);
    }
  })
}

interface CreateModuleParam {
  x: number;
  y: number;
  type: ModuleBrand
}
const createDelay = (param: CreateModuleParam): Delay => {
  return {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      delayTime: 0.1,
      maxDelayTime: 10,
    },
    destinations: [],
  }
}

const createBiquadFilter = (param: CreateModuleParam): BiquadFilter => {

  return {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      type: 'lowpass',
      frequency: 350,
      detune: 0,
      Q: 1,
      gain: 0,
    },
    destinations: [],
  }
}

const createGainModule = ( param: CreateModuleParam): Gain => {
  return {
    id: nanoid(),
    brand: 'gain',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      gain: 0.3,
    },
    destinations: [],
  }
}

const createOscillator = (param: CreateModuleParam): Oscillator => {
  return {
    id: nanoid(),
    brand: 'oscillator',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      isPlaying: false,
      type: 'sine',
      frequency: 440,
      detune: 0,
    },
    destinations: [],
  }
}


const updateConnectableModule = ({ brand, module, param }: UpdateModuleEvent, state: AudiOtterState) => {
  switch (brand) {
    case 'delay': {
      module.param = param;
      const node = state.webAudio.node.get(module.id) as DelayNode;
      if (node) {
        node.delayTime.value = param.delayTime;
      }
    }
    break;
    case 'biquad_filter': {
      module.param = param
      const node = state.webAudio.node.get(module.id) as BiquadFilterNode;
      if (node) {
        node.type = param.type;
        node.frequency.value = param.frequency;
        node.detune.value = param.detune;
        node.Q.value = param.Q;
        node.gain.value = param.gain;
      }
    }
    break;
    case 'gain': {
      module.param = param
      const node = state.webAudio.node.get(module.id) as GainNode;
      if (node) {
        node.gain.value = param.gain;
      }
    }
    break;
    case 'oscillator': {
      const node = state.webAudio.node.get(module.id) as OscillatorNode;
      if (!node) return
      if (module.param.isPlaying === param.isPlaying) {
        node.type = param.type;
        node.frequency.value = param.frequency;
        node.detune.value = param.detune;
        module.param = {
          ...param,
        };
        return;
      }
      module.param = {
        ...param,
      };
      if (param.isPlaying) {
        node.start();
      } else {
        node.stop();
        const newNode = node.context.createOscillator();
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
          connect(module, desModule, des, state.webAudio.context, state.webAudio.node);
        });
        newNode.type = param.type;
        newNode.frequency.value = param.frequency;
        newNode.detune.value = param.detune;
        module.param = param
        state.webAudio.node.set(module.id, newNode);
      }
      break;
    }
    default:
      throw new Error('not support')
  }
}

const createModule = (param: CreateModuleParam): Module => {
  switch (param.type) {
    case 'delay':
      return createDelay(param);
    case 'biquad_filter':
      return createBiquadFilter(param);
    case 'gain':
      return createGainModule(param);
    case 'oscillator':
      return createOscillator(param);
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
  const module = createModule(param);
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
    disconnect(srcModule, desModule, desInfo!, state.webAudio.context, state.webAudio.node);
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

  disconnect(module, desModule, oldInfo, state.webAudio.context, state.webAudio.node);
  connect(module, desModule, desInfo, state.webAudio.context, state.webAudio.node);

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
