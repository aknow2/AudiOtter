import { BiquadFilter, ConnectableModule, Delay, Gain, MicIn, Module, Oscillator, OutModule, SpeakerOut, WaveShaper } from "./types";

type ConnectableModuleSchema = ConnectableModule;

type OutModuleSchema = OutModule;

type Schema = ConnectableModuleSchema | OutModuleSchema;

const toMicInSchema = (module: MicIn): MicIn => {
  return {
    id: module.id,
    brand: 'mic_in',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromMicInSchema = async (schema: MicIn): Promise<MicIn> => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return {
    id: schema.id,
    brand: 'mic_in',
    position: schema.position,
    destinations: schema.destinations,
    param: {
      stream: mediaStream,
    },
  }
}

const toDelaySchema = (module: Delay): Delay => {
  return {
    id: module.id,
    brand: 'delay',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromDelaySchema = (schema: Delay): Delay => {
  return {
    id: schema.id,
    param: schema.param,
    brand: 'delay',
    position: schema.position,
    destinations: schema.destinations,
  }
}

const toGainSchema = (module: Gain): Gain => {
  return {
    id: module.id,
    brand: 'gain',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromGainSchema = (schema: Gain): Gain => {

  return {
    id: schema.id,
    param: schema.param,
    brand: 'gain',
    position: schema.position,
    destinations: schema.destinations,
  }
}

const toOscillatorSchema = (module: Oscillator): Oscillator => {
  return {
    id: module.id,
    brand: 'oscillator',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromOscillatorSchema = (schema: Oscillator): Oscillator => {
  return {
    id: schema.id,
    brand: 'oscillator',
    position: schema.position,
    destinations: schema.destinations,
    param: {
      ...schema.param,
      isPlaying: false,
    },
  }
}

const toBiquadFilterSchema = (module: BiquadFilter): BiquadFilter => {
  return {
    id: module.id,
    brand: 'biquad_filter',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromBiquadFilterSchema = (schema: BiquadFilter): BiquadFilter => {
  return {
    id: schema.id,
    brand: 'biquad_filter',
    position: schema.position,
    destinations: schema.destinations,
    param: schema.param,
  }
}

const toSpeakerOutSchema = (module: SpeakerOut): SpeakerOut => {
  return {
    id: module.id,
    brand: 'speaker_out',
    position: module.position,
    destinations: module.destinations,
  }
}

const fromSpeakerOutSchema = (schema: SpeakerOut): SpeakerOut => {
  return {
    id: schema.id,
    brand: 'speaker_out',
    position: schema.position,
    destinations: schema.destinations,
  }
}

const toWaveShaperSchema = (module: WaveShaper): WaveShaper => {
  const curve = Array.from(module.param.curve);
  return {
      id: module.id,
      brand: 'wave_shaper',
      position: module.position,
      destinations: module.destinations,
      param: {
        ...module.param,
        curve,
      },
    }
}

const fromWaveShaperSchema = (schema: WaveShaper): WaveShaper => {

  return {
    id: schema.id,
    brand: 'wave_shaper',
    position: schema.position,
    destinations: schema.destinations,
    param: {
      ...schema.param,
      curve: new Float32Array(schema.param.curve),
    },
  }
}

export const saveModules = (modules: Module[], storageKey: string) => {

  const schemas = modules.map(module => {
    switch (module.brand) {
      case 'delay':
        return toDelaySchema(module);
      case 'gain':
        return toGainSchema(module);
      case 'oscillator':
        return toOscillatorSchema(module);
      case 'biquad_filter':
        return toBiquadFilterSchema(module);
      case 'mic_in':
        return toMicInSchema(module);
      case 'speaker_out':
        return toSpeakerOutSchema(module);
      case 'wave_shaper':
        return toWaveShaperSchema(module);
    }
  });

  const json = JSON.stringify(schemas);
  localStorage.setItem(storageKey, json);
}

export const loadModules = async (storageKey: string): Promise< Module[] | undefined> => {
  const json = localStorage.getItem(storageKey);
  if (!json) {
    return undefined;
  }

  const schemas = JSON.parse(json) as Schema[];
  const modules = schemas.map(schema => {
    switch (schema.brand) {
      case 'delay':
        return fromDelaySchema(schema);
      case 'gain':
        return fromGainSchema(schema);
      case 'oscillator':
        return fromOscillatorSchema(schema);
      case 'biquad_filter':
        return fromBiquadFilterSchema(schema);
      case 'speaker_out':
        return fromSpeakerOutSchema(schema);
      case 'mic_in':
        return fromMicInSchema(schema);
      case 'wave_shaper':
        return fromWaveShaperSchema(schema);
      default:
        throw new Error(`Unknown module brand: ${schema}`);
    }
  });

  return await Promise.all(modules);
}
