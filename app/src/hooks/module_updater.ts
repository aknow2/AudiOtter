import { nanoid } from "nanoid";
import { BiquadFilter, Delay, OutModule, Link, LinkMap, AudiOtterState, Module, ModuleBrand, ConnectableModule, UpdateModuleEvent, Gain, Oscillator, DestinationInfo, NodeMap, WaveShaper, CurveType, Convolver, Recording } from "./types";
import ir from '../assets/sounds/ir.wav';
import { createRecordingInvoker } from "../components/editors/composable/useRecording";

export const isConnectableModule = (module: Module|undefined): module is ConnectableModule => {
  return module?.brand === 'mic_in'
    || module?.brand === 'biquad_filter'
    || module?.brand === 'delay'
    || module?.brand === 'gain'
    || module?.brand === 'oscillator'
    || module?.brand === 'wave_shaper'
    || module?.brand === 'convolver';
}

const isSpeaker = (module: Module|undefined): module is OutModule => {
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

export const createNode = async (module: ConnectableModule | Recording, context: AudioContext): Promise<AudioNode> => {
  switch (module.brand) {
    case 'delay': {
      const node = new DelayNode(context, {
        delayTime: module.param.delayTime.value,
        maxDelayTime: module.param.maxDelayTime.value,
      });
      return node;
    }
    case 'biquad_filter': {
      const node = new BiquadFilterNode(context, {
        Q: module.param.Q.value,
        frequency: module.param.frequency.value,
        detune: module.param.detune.value,
        gain: module.param.gain.value,
        type: module.param.type,
      });
      return node;
    }
    case 'gain': {
      const node = new GainNode(context, {
        gain: module.param.gain.value,
      });
      return node;
    }
    case 'oscillator': {
      const node = new OscillatorNode(context, {
        type: module.param.type,
        frequency: module.param.frequency.value,
        detune: module.param.detune.value,
      });
      return node;
    }
    case "mic_in": {
      const node = context.createMediaStreamSource(module.param.stream);
      return node;
    }
    case "wave_shaper": {
      const node = new WaveShaperNode(context, {
        curve: module.param.curve,
        oversample: module.param.oversample,
      });
      return node;
    }
    case "convolver": {
      const res = await fetch(ir);
      const arrayBuffer = await res.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      const node = new ConvolverNode(context, {
        buffer: audioBuffer,
        disableNormalization: false,
      });
      return node;
    }
    case "recording": {
      const node = context.createMediaStreamDestination();
      return node;
    }
  }
}

const getOrCreateNode = async (module: ConnectableModule | Recording, context: AudioContext, nodeMap: NodeMap): Promise<AudioNode> => {
  const node = nodeMap.get(module.id);
  if (node) {
    return node;
  }
  const newNode = await createNode(module, context);
  nodeMap.set(module.id, newNode);
  return newNode;
}

const connect = async (
  srcModule: ConnectableModule,
  desModule: Module,
  desInfo: DestinationInfo,
  context: AudioContext,
  nodeMap: NodeMap) => {
  const srcNode = await  getOrCreateNode(srcModule, context, nodeMap)
  console.log(srcModule.brand, 'to', desModule.brand, context.state, nodeMap)
  if (isSpeaker(desModule)) {
    srcNode.connect(context.destination);
  } else {
    const desNode = await getOrCreateNode(desModule, context, nodeMap)
    const des =  getDestination(desNode, desInfo)
    srcNode.connect(des);
  }
}

const disconnect = (srcModule: ConnectableModule, desModule: Module, desInfo: DestinationInfo, context: AudioContext, nodeMap: NodeMap) => {
  const srcNode = nodeMap.get(srcModule.id);

  if (!srcNode) {
    throw new Error('Not found node in nodeMap');
  }

  if (isSpeaker(desModule)) {
    srcNode.disconnect(context.destination)
  } else {
    const desNode = nodeMap.get(desModule.id);
    if (!desNode) {
      throw new Error('Not found node in nodeMap');
    }
    srcNode.disconnect(getDestination(desNode, desInfo))
  }
}

export const connectModuleProcess = async (
  srcModule: Module,
  desModule: Module,
  destination: DestinationInfo,
  state: AudiOtterState) => {
  const linkId = createLinkId(srcModule, desModule);
  const { linkMap, webAudio: { context, node } } = state;
  if (canCreateLink(linkMap, srcModule, desModule, linkId)) {
    const link = createLink(srcModule, desModule, linkId)
    linkMap.set(link.id, link)
    await connect(srcModule, desModule, destination, context, node);
  }
}

export const connectModules = async (
  srcModule: Module,
  state: AudiOtterState,
) => {
  for (const destination of srcModule.destinations) {
    console.log('connect', srcModule.id, destination.id)
    const desModule = state.modules.find((m) => m.id === destination.id);
    if (desModule) {
      await connectModuleProcess(srcModule, desModule, destination, state);
    }
  }
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
      delayTime: {
        value: 0.1,
        min: 0,
        max: 10,
        step: 0.1,
      },
      maxDelayTime: {
        value: 10,
        min: 0,
        max: 10,
        step: 0.1,
      },
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
      frequency: {
        value: 300,
        min: 0,
        max: 1000,
        step: 1,
      },
      Q: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
      gain: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
      detune: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
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
      gain: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
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
      frequency: {
        value: 300,
        min: 0,
        max: 1000,
        step: 1,
      },
      detune: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
    destinations: [],
  }
}

const findDistination = (module: Module, state: AudiOtterState): [Module, DestinationInfo][] => {
  return state
          .modules
          .reduce<[Module, DestinationInfo][]>((acc, m) => {
            const des = module.destinations.find((d) => d.id === m.id)
            if (des) {
              acc.push([m, des]);
            }
            return acc;
          }, []);
}

const updateModule = async (ev: UpdateModuleEvent, state: AudiOtterState) => {
  switch (ev.brand) {
    case 'recording': {
      const { module, param } = ev;
      module.param = param
      if (param.isRecording) {
        const node = state.webAudio.node.get(module.id) as MediaStreamAudioDestinationNode;
        if (!node) return
        const invoker = createRecordingInvoker(node);
        module.stopRecording = await invoker();
      } else if (module.stopRecording) {
        module.stopRecording();
      }
      break;
    }
    case 'delay': {
      const { module, param } = ev;
      module.param = param;
      const node = state.webAudio.node.get(module.id) as DelayNode;
      if (node) {
        node.delayTime.value = param.delayTime.value;
      }
    }
    break;
    case 'biquad_filter': {
      const { module, param } = ev;
      module.param = param
      const node = state.webAudio.node.get(module.id) as BiquadFilterNode;
      if (node) {
        node.type = param.type;
        node.frequency.value = param.frequency.value;
        node.detune.value = param.detune.value;
        node.Q.value = param.Q.value;
        node.gain.value = param.gain.value;
      }
    }
    break;
    case 'gain': {
      const { module, param } = ev;
      module.param = param
      const node = state.webAudio.node.get(module.id) as GainNode;
      if (node) {
        node.gain.value = param.gain.value;
      }
    }
    break;
    case 'oscillator': {
      const { module, param } = ev;
      const node = state.webAudio.node.get(module.id) as OscillatorNode;
      if (!node) return
      if (module.param.isPlaying === param.isPlaying) {
        node.type = param.type;
        node.frequency.value = param.frequency.value;
        node.detune.value = param.detune.value;
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
        module.param = param

        const newNode = await createNode(module, state.webAudio.context);
        state.webAudio.node.delete(module.id);
        state.webAudio.node.set(module.id, newNode);

        const destinations = findDistination(module, state);
        for (const [desModule, des] of destinations) {
          await connect(module, desModule, des, state.webAudio.context, state.webAudio.node);
        }
      }
      break;
    }
    case 'wave_shaper': {
      const { module, param } = ev;
      const curve = createCurve(param.curveType, param.amount.value);
      module.param = {
        ...param,
        curve,
      }
      const node = state.webAudio.node.get(module.id) as WaveShaperNode;
      if (node) {
        node.oversample = param.oversample;
        node.curve = curve as Float32Array;
      }
      break
    }
    case 'convolver': {
      const { module, param } = ev;
      module.param = param
      break;
    }
    case 'update_mic_in': {
      const { module, audioInput } = ev;
      // disconnect
      const destinations = findDistination(module, state);
      for (const [desModule, des] of destinations) {
        disconnect(module, desModule, des, state.webAudio.context, state.webAudio.node);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioInput } });
      module.param.mic = audioInput;
      module.param.stream = newStream;
      state.webAudio.node.delete(module.id);

      for (const [desModule, des] of destinations) {
        await connect(module, desModule, des, state.webAudio.context, state.webAudio.node);
      }

      break;
    }
    default:
      throw new Error('Fail to update module')
  }
}


const createCurve = (type: CurveType, amount: number): Float32Array => {
    const samples = 44100; // This is a common value; you might want to adjust based on your needs
    let curve= new Float32Array(samples);

    switch (type) {
        case 'distortion':
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                curve[i] = (Math.PI + amount) * x / (Math.PI + (amount * Math.abs(x)));
            }
            break;
        case 'fuzz':
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                curve[i] = x * Math.abs(x) / (Math.pow(x, 2) + (amount - 1) * Math.abs(x) + 1);
            }
            break;
        case 'overdrive':
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                if (x < 0) {
                    curve[i] = -(1 / (1 - x) - 1);
                } else {
                    curve[i] = 1 / (1 + x) - 1;
                }
            }
            break;
        case 'sawtooth':
            for (let i = 0; i < samples; ++i) {
                curve[i] = 2 * (i / samples) - 1;
            }
            break;
        case 'none':
            curve = new Float32Array(samples);
            for (let i = 0; i < samples; ++i) {
                curve[i] = (i * 2) / samples - 1;
            }
            break;
        default:
            throw new Error("Unknown type for WaveShaperNode curve.");
    }

    return curve;
}

const createWaveShaper = (param: CreateModuleParam): WaveShaper => {
  const curveType: CurveType = 'distortion';
  const amount = 1000;
  return {
    id: nanoid(),
    brand: 'wave_shaper',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      curveType,
      curve: createCurve(curveType, amount),
      amount: {
        value: amount,
        min: 1,
        max: amount * 4,
        step: 1,
      },
      oversample: '4x',
    },
    destinations: [],
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
    case 'wave_shaper':
      return createWaveShaper(param);
    case 'convolver':
      return createConvolver(param);
    case 'recording':
      return createRecording(param);
    case 'speaker_out':
    case 'mic_in':
      throw new Error('Not implemented');
  }
}

const createRecording = (param: CreateModuleParam): Recording => {
  return {
    id: nanoid(),
    brand: 'recording',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {
      isRecording: false,
    },
    destinations: [],
  }
}

const createConvolver = (param: CreateModuleParam): Convolver => {
  return {
    id: nanoid(),
    brand: 'convolver',
    position: {
      x: param.x,
      y: param.y,
    },
    param: {},
    destinations: [],
  }
}

export const createModuleUpdater = (state: AudiOtterState) => (ev: UpdateModuleEvent) => {
  const { module } = ev;
  updateModule(ev, state).then(() => {
    state.modules = state.modules.map((m) => {
      if (m.id === module.id) {
        return module;
      }
      return m;
    })
  });
  
}

export const createModuleCreator = (state: AudiOtterState) => (param: CreateModuleParam) => {
  const module = createModule(param);
  state.modules = [...state.modules, module];
}

export const onDeleteModuleHandler = (state: AudiOtterState) => (moduleId: string) => {
  const deleteModule = state.modules.find((m) => m.id === moduleId);
  if (deleteModule) {
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

export const changeDestination = (state: AudiOtterState) => async (moduleId: string, desInfo: DestinationInfo) => {
  const module = state.modules.find((m) => m.id === moduleId)
  const oldInfo = module?.destinations.find((d) => d.id === desInfo.id);
  const desModule = state.modules.find((m) => m.id === desInfo.id);
  if (!isConnectableModule(module) || !oldInfo || !desModule) {
    throw new Error('Not found' + module + oldInfo + desModule)
  }

  disconnect(module, desModule, oldInfo, state.webAudio.context, state.webAudio.node);
  await connect(module, desModule, desInfo, state.webAudio.context, state.webAudio.node);

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
