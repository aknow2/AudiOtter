import { nanoid } from "nanoid";
import { BiquadFilter, Delay, Link, LinkMap, AudiOtterState, Module, ModuleBrand, ConnectableModule, UpdateModuleEvent, Gain, Oscillator, DestinationInfo, WaveShaper, CurveType, Convolver, Recording } from "./types";
import createNodeManager from "./node";

const nodeManager = createNodeManager();
export const isConnectableModule = (module: Module|undefined): module is ConnectableModule => {
  return module?.brand === 'mic_in'
    || module?.brand === 'biquad_filter'
    || module?.brand === 'delay'
    || module?.brand === 'gain'
    || module?.brand === 'oscillator'
    || module?.brand === 'wave_shaper'
    || module?.brand === 'convolver';
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


const connectModuleProcess = (
  srcModule: Module,
  desModule: Module,
  destination: DestinationInfo,
  state: AudiOtterState) => {
  const linkId = createLinkId(srcModule, desModule);
  const { linkMap, webAudio: { context } } = state;
  if (canCreateLink(linkMap, srcModule, desModule, linkId)) {
    const link = createLink(srcModule, desModule, linkId)
    linkMap.set(link.id, link)
    nodeManager.connect(srcModule, desModule, destination, context);
  }
}

export const connectModules = (
  srcModule: Module,
  state: AudiOtterState,
) => {
  for (const destination of srcModule.destinations) {
    const desModule = state.modules.find((m) => m.id === destination.id);
    if (desModule) {
      connectModuleProcess(srcModule, desModule, destination, state);
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

export const initModuleAndLink = (modules: Module[], state: AudiOtterState) => {
  for (const module of modules) {
    nodeManager.create(module, state.webAudio.context);
  }
  for (const module of modules) {
    connectModules(module, state);
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

const updateModule = async (ev: UpdateModuleEvent, state: AudiOtterState): Promise<Module> => {
  switch (ev.brand) {
    case 'recording': {
      const { module, param } = ev;
      if (param.isRecording) {
        nodeManager.recorder.start(module);
      } else {
        nodeManager.recorder.stop(module);
      }
      return {
        ...module,
        param: {
          ...param
        }
      }
    }
    case 'delay': {
      const { module, param } = ev;
      module.param = param;
      await nodeManager.disptach(ev);
      return module;
    }
    case 'biquad_filter': {
      const { module, param } = ev;
      module.param = param
      await nodeManager.disptach(ev);
      return module;
    }
    case 'gain': {
      const { module, param } = ev;
      module.param = param
      await nodeManager.disptach(ev);
      return module;
    }
    case 'oscillator': {
      const { module, param } = ev;

      if (module.param.isPlaying === param.isPlaying) {
        nodeManager.disptach({
          brand: 'update_oscillator',
          module,
          param,
        });
        module.param = {
          ...param,
        };
        return {
          ...module,
          param: {
            ...param,
          }
        };
      }

      if (param.isPlaying) {
        nodeManager.disptach({
          brand: 'start_oscillator',
          module,
        })

      } else {
        await nodeManager.disptach({
          brand: 'stop_oscillator',
          module,
          context: state.webAudio.context,
        });

        const destinations = findDistination(module, state);
        for (const [desModule, des] of destinations) {
          await nodeManager.connect(module, desModule, des, state.webAudio.context);
        }
      }
      return {
        ...module,
        param: {
          ...param,
        }
      };
    }
    case 'wave_shaper': {
      const { module, param } = ev;
      const curve = createCurve(param.curveType, param.amount.value);
      await nodeManager.disptach(ev);
      return {
        ...module,
        param: {
          ...param,
          curve,
        }
      };
    }
    case 'convolver': {
      const { module, param } = ev;
      module.param = param
      return {
        ...module,
        param: {
          ...param,
        }
      };
    }
    case 'update_mic_in': {
      const { module, audioInput } = ev;
      // disconnect
      const destinations = findDistination(module, state);
      for (const [desModule, des] of destinations) {
        nodeManager.disconnect(module, desModule, des, state.webAudio.context);
      }
      nodeManager.deleteNode(module.id);

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: audioInput,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        }
      });
      module.param.mic = audioInput;
      module.param.stream = newStream;

      for (const [desModule, des] of destinations) {
        await nodeManager.connect(module, desModule, des, state.webAudio.context);
      }
      return {
        ...module,
        param: {
          ...module.param,
        }
      }
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
  updateModule(ev, state).then((module) => {
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
  nodeManager.create(module, state.webAudio.context);
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
    nodeManager.disconnect(srcModule, desModule, desInfo!, state.webAudio.context);
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

  nodeManager.disconnect(module, desModule, oldInfo, state.webAudio.context);
  nodeManager.connect(module, desModule, desInfo, state.webAudio.context);

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
