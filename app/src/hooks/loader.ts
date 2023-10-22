import { BiquadFilter, BiquadFilterParam, ConnectableModule, Delay, DelayParam, Gain, GainParam, MicIn, MicInParam, Module, ModuleParam, Oscillator, OscillatorParam, OutModule, SpeakerOut } from "./types";

type ConnectableModuleSchema<T extends ConnectableModule, P extends ModuleParam> = Omit<T, 'source'> & {
  param: P
}

type OutModuleSchema<T extends OutModule> = Omit<T, 'context'>

type Schema = ConnectableModuleSchema<ConnectableModule, ModuleParam> | OutModuleSchema<OutModule>

const toMicInSchema = (module: MicIn): ConnectableModuleSchema<MicIn, MicInParam> => {
  return {
    id: module.id,
    brand: 'mic_in',
    position: module.position,
    destinations: module.destinations,
    param: {}
  }
}

const fromMicInSchema = async (schema: ConnectableModuleSchema<MicIn, MicInParam>, context: AudioContext): Promise<MicIn> => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaStreamSource = context.createMediaStreamSource(mediaStream);

  return {
    id: schema.id,
    brand: 'mic_in',
    position: schema.position,
    destinations: schema.destinations,
    source: mediaStreamSource,
  }
}

const toDelaySchema = (module: Delay): ConnectableModuleSchema<Delay, DelayParam> => {
  return {
    id: module.id,
    brand: 'delay',
    position: module.position,
    destinations: module.destinations,
    param: {
      delayTime: module.source.delayTime.value,
      maxDelayTime: 10,
    }
  }
}

const fromDelaySchema = (schema: ConnectableModuleSchema<Delay, DelayParam>, context: AudioContext): Delay => {
  const delay = context.createDelay(schema.param.maxDelayTime);
  delay.delayTime.value = schema.param.delayTime;
  return {
    id: schema.id,
    brand: 'delay',
    position: schema.position,
    destinations: schema.destinations,
    source: delay,
  }
}

const toGainSchema = (module: Gain): ConnectableModuleSchema<Gain, GainParam> => {
  return {
    id: module.id,
    brand: 'gain',
    position: module.position,
    destinations: module.destinations,
    param: {
      gain: module.source.gain.value,
    }
  }
}

const fromGainSchema = (schema: ConnectableModuleSchema<Gain, GainParam>, context: AudioContext): Gain => {
  const gain = context.createGain();
  gain.gain.value = schema.param.gain;
  return {
    id: schema.id,
    brand: 'gain',
    position: schema.position,
    destinations: schema.destinations,
    source: gain,
  }
}

const toOscillatorSchema = (module: Oscillator): ConnectableModuleSchema<Oscillator, OscillatorParam> => {
  return {
    id: module.id,
    brand: 'oscillator',
    position: module.position,
    destinations: module.destinations,
    isPlaying: module.isPlaying,
    param: {
      type: module.source.type,
      frequency: module.source.frequency.value,
      detune: module.source.detune.value,
      isPlaying: module.isPlaying,
    }
  }
}

const fromOscillatorSchema = (schema: ConnectableModuleSchema<Oscillator, OscillatorParam>, context: AudioContext): Oscillator => {
  const oscillator = context.createOscillator();
  oscillator.type = schema.param.type;
  oscillator.frequency.value = schema.param.frequency;
  oscillator.detune.value = schema.param.detune;
  return {
    id: schema.id,
    brand: 'oscillator',
    position: schema.position,
    destinations: schema.destinations,
    isPlaying: schema.isPlaying,
    source: oscillator,
  }
}

const toBiquadFilterSchema = (module: BiquadFilter): ConnectableModuleSchema<BiquadFilter, BiquadFilterParam> => {
  return {
    id: module.id,
    brand: 'biquad_filter',
    position: module.position,
    destinations: module.destinations,
    param: {
      type: module.source.type,
      frequency: module.source.frequency.value,
      detune: module.source.detune.value,
      Q: module.source.Q.value,
      gain: module.source.gain.value,
    }
  }
}

const fromBiquadFilterSchema = (schema: ConnectableModuleSchema<BiquadFilter, BiquadFilterParam>, context: AudioContext): BiquadFilter => {
  const biquadFilter = context.createBiquadFilter();
  biquadFilter.type = schema.param.type;
  biquadFilter.frequency.value = schema.param.frequency;
  biquadFilter.detune.value = schema.param.detune;
  biquadFilter.Q.value = schema.param.Q;
  biquadFilter.gain.value = schema.param.gain;
  return {
    id: schema.id,
    brand: 'biquad_filter',
    position: schema.position,
    destinations: schema.destinations,
    source: biquadFilter,
  }
}

const toSpeakerOutSchema = (module: SpeakerOut): OutModuleSchema<SpeakerOut> => {
  return {
    id: module.id,
    brand: 'speaker_out',
    position: module.position,
    destinations: module.destinations,
  }
}

const fromSpeakerOutSchema = (schema: OutModuleSchema<SpeakerOut>, context: AudioContext): SpeakerOut => {
  return {
    id: schema.id,
    brand: 'speaker_out',
    position: schema.position,
    destinations: schema.destinations,
    context,
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
    }
  });

  const json = JSON.stringify(schemas);
  localStorage.setItem(storageKey, json);
}

export const loadModules = async (storageKey: string, audioContext: AudioContext): Promise< Module[] | undefined> => {
  const json = localStorage.getItem(storageKey);
  if (!json) {
    return undefined;
  }

  const schemas = JSON.parse(json) as Schema[];
  const modules = schemas.map(schema => {
    switch (schema.brand) {
      case 'delay':
        return fromDelaySchema(schema as ConnectableModuleSchema<Delay, DelayParam>, audioContext);
      case 'gain':
        return fromGainSchema(schema as ConnectableModuleSchema<Gain, GainParam>, audioContext);
      case 'oscillator':
        return fromOscillatorSchema(schema as ConnectableModuleSchema<Oscillator, OscillatorParam>, audioContext);
      case 'biquad_filter':
        return fromBiquadFilterSchema(schema as ConnectableModuleSchema<BiquadFilter, BiquadFilterParam>, audioContext);
      case 'speaker_out':
        return fromSpeakerOutSchema(schema as OutModuleSchema<SpeakerOut>, audioContext);
      case 'mic_in':
        return fromMicInSchema(schema as ConnectableModuleSchema<MicIn, MicInParam>, audioContext);
    }
  });

  return await Promise.all(modules);
}
