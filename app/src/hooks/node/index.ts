import { createRecordingInvoker } from "../../components/editors/composable/useRecording";
import { ConnectableModule, DestinationInfo, Module, NodeMap, Oscillator, OscillatorParam, OutModule, Recording, UpdateModuleEvent } from "../types";
import { createNode } from "./creator";

const isSpeaker = (module: Module|undefined): module is OutModule => {
  return module?.brand === 'speaker_out';
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
const getDestination = (node: AudioNode, desInfo: DestinationInfo) => {
  if (desInfo.target === 'node') {
    return node;
  }
  // fix me: Using Any, Not typesafe and it's not cool.
  return (node as any)[desInfo.paramKey] as any;
}


const createDisconnect = (nodeMap: NodeMap) => (srcModule: ConnectableModule, desModule: Module, desInfo: DestinationInfo, context: AudioContext) => {
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

export const createConnect = (nodeMap: NodeMap) => async (
  srcModule: ConnectableModule,
  desModule: Module,
  desInfo: DestinationInfo,
  context: AudioContext) => {
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

type UpdateOscillatorNode = {
  brand: 'update_oscillator';
  module: Oscillator;
  param: OscillatorParam;
}

type StartOscillator = {
  brand: 'start_oscillator';
  module: Oscillator;
}
type StopOscillator = {
  brand: 'stop_oscillator';
  module: Oscillator;
  context: AudioContext;
}

type UpdateNodeEvent = UpdateOscillatorNode | UpdateModuleEvent | StartOscillator | StopOscillator;

const createNodeEventDispatcher = ({ nodeMap }: { nodeMap: NodeMap }) => async (ev: UpdateNodeEvent) => {

  switch (ev.brand) {
    case 'delay':{
      const node = nodeMap.get(ev.module.id) as DelayNode;
      if (node === undefined) {
        return
      }
      node.delayTime.value = ev.param.delayTime.value;
      break;
    }
    case 'biquad_filter': {
      const node = nodeMap.get(ev.module.id) as BiquadFilterNode;
      if (node === undefined) {
        return
      }
      node.frequency.value = ev.param.frequency.value;
      node.detune.value = ev.param.detune.value;
      node.Q.value = ev.param.Q.value;
      node.gain.value = ev.param.gain.value;
      node.type = ev.param.type;
      break;
    }
    case 'gain': {
      const node = nodeMap.get(ev.module.id) as GainNode;
      if (node === undefined) {
        return
      }
      node.gain.value = ev.param.gain.value;
      break;
    }
    case 'update_oscillator': {
      const { module, param } = ev;
      const node = nodeMap.get(module.id) as OscillatorNode;
      node.type = param.type;
      node.frequency.value = param.frequency.value;
      node.detune.value = param.detune.value;
      break;
    }
    case 'start_oscillator': {
      const node = nodeMap.get(module.id) as OscillatorNode;
      node.start();
      break;
    }
    case 'stop_oscillator': {
      const { module, context } = ev;
      const node = nodeMap.get(module.id) as OscillatorNode;
      node.stop();
      const newNode = await createNode(module, context);
      nodeMap.delete(module.id);
      nodeMap.set(module.id, newNode);
      break;
    }
    case 'wave_shaper': {
      const { module, param } = ev;
      const node = nodeMap.get(module.id) as WaveShaperNode;
      if (node === undefined) {
        return
      }
      node.curve = param.curve as Float32Array;
      node.oversample = param.oversample;
      break;
    }
  }
}

const createRecorder = (nodeMap: NodeMap) => {
  const stoppers = new Map<string, () => Promise<void>>();

  const start = async (module: Recording) => {
    const node = nodeMap.get(module.id) as MediaStreamAudioDestinationNode;
    const invoker = await createRecordingInvoker(node)
    const stopper = await invoker();
    stoppers.set(module.id, stopper);
  }

  const stop = async (module: Recording) => {
    const stopper = stoppers.get(module.id);
    stoppers.delete(module.id);
    if (stopper) {
      await stopper();
    }
  }


  return {
    start,
    stop,
  }
}

const createNodeManager = () => {
  const nodeMap: NodeMap = new Map();
  return {
    connect: createConnect(nodeMap),
    disconnect: createDisconnect(nodeMap),
    disptach: createNodeEventDispatcher({ nodeMap }),
    deleteNode: nodeMap.delete,
    recorder: createRecorder(nodeMap),
    nodeMap,
  }
}

export default createNodeManager;
