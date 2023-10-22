export interface Position {
  x: number;
  y: number;
}

type AudioNodeParam <T extends AudioNodeOptions> = {
  [K in keyof T]: T[K] extends (number | undefined) ? { min: number, max: number, step: number, value: number } : T[K];
}

type BaseModuleParam<T extends AudioNodeOptions, O extends keyof T = never> = Omit<
  Required<AudioNodeParam<T>>,'channelCount' | 'channelCountMode' | 'channelInterpretation' | O> 
export interface BaseModule {
  id: string;
  position: Position;
  destinations: DestinationInfo[];
}

export type MicInParam = BaseModuleParam<{}> & {
  stream: MediaStream;
}
export interface MicIn extends BaseModule {
  brand: 'mic_in';
  param: MicInParam;
}

type AudioParamKeys<T> = {
    [K in keyof T]: T[K] extends AudioParam ? K : never;
}[keyof T];
export type BiquadFilterParam = BaseModuleParam<BiquadFilterOptions>
export type BiquadFilterNodeAudioParamKeys = AudioParamKeys<BiquadFilterNode>;
export interface BiquadFilter extends BaseModule {
  brand: 'biquad_filter';
  param: BiquadFilterParam;
}

export type DelayParam = BaseModuleParam<DelayOptions>
export interface Delay extends BaseModule {
  brand: 'delay';
  param: DelayParam;
}

export type GainParam = BaseModuleParam<GainOptions>
export interface Gain extends BaseModule {
  brand: 'gain';
  param: GainParam;
}
export type OscillatorParam = BaseModuleParam<OscillatorOptions, 'periodicWave'> & {
  isPlaying: boolean;
}
export interface Oscillator extends BaseModule {
  brand: 'oscillator';
  param: OscillatorParam;
}


export type ModuleParam = BiquadFilterParam | DelayParam | GainParam | OscillatorParam | MicInParam;

interface NodeDestination {
  id: string;
  target: 'node';
}

interface ParamDestination {
  id: string;
  target: 'param';
  paramKey: string;
}

export type DestinationInfo = NodeDestination | ParamDestination;

export type InOutModule =  BiquadFilter | Delay | Gain | MicIn | Oscillator;
export type InModule = MicIn;
export type ConnectableModule = InModule | InOutModule;


type BaseUpdateModuleEvent<T extends Module, P extends ModuleParam> = { 
  brand: T['brand'];
  module: T;
  param: P;
}

export type UpdateBiquadFilterEvent = BaseUpdateModuleEvent<BiquadFilter, BiquadFilterParam>
export type UpdateDelayEvent = BaseUpdateModuleEvent<Delay, DelayParam>
export type UpdateGainEvent = BaseUpdateModuleEvent<Gain, GainParam>
export type UpdateOscillatorEvent = BaseUpdateModuleEvent<Oscillator, OscillatorParam>
export type UpdateModuleEvent = UpdateBiquadFilterEvent
  | UpdateDelayEvent
  | UpdateGainEvent 
  | UpdateOscillatorEvent;


export interface SpeakerOut extends BaseModule {
  brand: 'speaker_out';
}

export interface Link {
  brand: 'link';
  id: string;
  sourceId: string;
  destinationId: string;
}

export interface LineFeedback {
  brand: 'line'
  srcId: string
  src: Position;
  des: Position
}

export type Feedback = LineFeedback;

export type OutModule = SpeakerOut;

export type OutBrand = OutModule['brand'];
export type SourceBrand = ConnectableModule['brand'];
export type ModuleBrand = OutBrand | SourceBrand;

export type Module = ConnectableModule | OutModule;
export type Item = Module | Link;
export type Status = 'title' | 'loading' | 'running';
export type LinkMap = Map<string, Link>;
export type NodeMap = Map<string, AudioNode>;

export interface AudiOtterState {
  status: Status;
  modules: Module[];
  linkMap: LinkMap;
  webAudio: {
    context: AudioContext;
    node: NodeMap;
  }
  selectedItems: string[];
  draggingItem?: string;
  feedBack?: Feedback;
}