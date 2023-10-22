export interface Position {
  x: number;
  y: number;
}

type BaseModuleParam<T extends AudioNodeOptions, O extends keyof T = never> = Omit<
  Required<T>,'channelCount' | 'channelCountMode' | 'channelInterpretation' | O> 
export interface BaseModule {
  id: string;
  position: Position;
  destinations: DestinationInfo[];
}

export interface MicIn extends BaseModule {
  brand: 'mic_in';
  source: MediaStreamAudioSourceNode;
}
export type MicInParam = BaseModuleParam<{}>

type AudioParamKeys<T> = {
    [K in keyof T]: T[K] extends AudioParam ? K : never;
}[keyof T];
export type BiquadFilterNodeAudioParamKeys = AudioParamKeys<BiquadFilterNode>;
export interface BiquadFilter extends BaseModule {
  brand: 'biquad_filter';
  source: BiquadFilterNode;
}
export type BiquadFilterParam = BaseModuleParam<BiquadFilterOptions>

export interface Delay extends BaseModule {
  brand: 'delay';
  source: DelayNode;
}
export type DelayParam = BaseModuleParam<DelayOptions>

export interface Gain extends BaseModule {
  brand: 'gain';
  source: GainNode;
}
export type GainParam = BaseModuleParam<GainOptions>

export interface Oscillator extends BaseModule {
  brand: 'oscillator';
  source: OscillatorNode;
  isPlaying: boolean;
}
export type OscillatorParam = BaseModuleParam<OscillatorOptions, 'periodicWave'> & {
  isPlaying: boolean;
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
  context: AudioContext;
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

export interface AudiOtterState {
  status: Status;
  modules: Module[];
  linkMap: LinkMap;
  selectedItems: string[];
  draggingItem?: string;
  feedBack?: Feedback;
}