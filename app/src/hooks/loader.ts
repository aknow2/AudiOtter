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
    param: module.param,
  }
}

const fromMicInSchema = async (schema: ConnectableModuleSchema<MicIn, MicInParam>): Promise<MicIn> => {
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

const toDelaySchema = (module: Delay): ConnectableModuleSchema<Delay, DelayParam> => {
  return {
    id: module.id,
    brand: 'delay',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromDelaySchema = (schema: ConnectableModuleSchema<Delay, DelayParam>): Delay => {
  return {
    id: schema.id,
    param: schema.param,
    brand: 'delay',
    position: schema.position,
    destinations: schema.destinations,
  }
}

const toGainSchema = (module: Gain): ConnectableModuleSchema<Gain, GainParam> => {
  return {
    id: module.id,
    brand: 'gain',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromGainSchema = (schema: ConnectableModuleSchema<Gain, GainParam>): Gain => {

  return {
    id: schema.id,
    param: schema.param,
    brand: 'gain',
    position: schema.position,
    destinations: schema.destinations,
  }
}

const toOscillatorSchema = (module: Oscillator): ConnectableModuleSchema<Oscillator, OscillatorParam> => {
  return {
    id: module.id,
    brand: 'oscillator',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromOscillatorSchema = (schema: ConnectableModuleSchema<Oscillator, OscillatorParam>): Oscillator => {
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

const toBiquadFilterSchema = (module: BiquadFilter): ConnectableModuleSchema<BiquadFilter, BiquadFilterParam> => {
  return {
    id: module.id,
    brand: 'biquad_filter',
    position: module.position,
    destinations: module.destinations,
    param: module.param,
  }
}

const fromBiquadFilterSchema = (schema: ConnectableModuleSchema<BiquadFilter, BiquadFilterParam>): BiquadFilter => {
  return {
    id: schema.id,
    brand: 'biquad_filter',
    position: schema.position,
    destinations: schema.destinations,
    param: schema.param,
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

const fromSpeakerOutSchema = (schema: OutModuleSchema<SpeakerOut>): SpeakerOut => {
  return {
    id: schema.id,
    brand: 'speaker_out',
    position: schema.position,
    destinations: schema.destinations,
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

export const loadModules = async (storageKey: string): Promise< Module[] | undefined> => {
  const json = localStorage.getItem(storageKey);
  if (!json) {
    return undefined;
  }

  const schemas = JSON.parse(json) as Schema[];
  const modules = schemas.map(schema => {
    switch (schema.brand) {
      case 'delay':
        return fromDelaySchema(schema as ConnectableModuleSchema<Delay, DelayParam>);
      case 'gain':
        return fromGainSchema(schema as ConnectableModuleSchema<Gain, GainParam>);
      case 'oscillator':
        return fromOscillatorSchema(schema as ConnectableModuleSchema<Oscillator, OscillatorParam>);
      case 'biquad_filter':
        return fromBiquadFilterSchema(schema as ConnectableModuleSchema<BiquadFilter, BiquadFilterParam>);
      case 'speaker_out':
        return fromSpeakerOutSchema(schema as OutModuleSchema<SpeakerOut>);
      case 'mic_in':
        return fromMicInSchema(schema as ConnectableModuleSchema<MicIn, MicInParam>);
    }
  });

  return await Promise.all(modules);
}
