export interface Position {
  x: number;
  y: number;
}

export type RangeSetting = {
  min: number;
  max: number;
  step: number;
  value: number;
}
type AudioNodeParam <T extends AudioNodeOptions> = {
  [K in keyof T]: T[K] extends (number | undefined) ? RangeSetting : T[K];
}
type AudioParamKeys<T> = {
    [K in keyof T]: T[K] extends AudioParam ? K : never;
}[keyof T];

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

export type ConvolverParam = BaseModuleParam<{}> 
export interface Convolver extends BaseModule {
  brand: 'convolver';
  param: ConvolverParam;
}

export type CurveType = 'none' | 'distortion' | 'fuzz' | 'overdrive' | 'sawtooth';
export type WaveShaperParam = BaseModuleParam<WaveShaperOptions> & {
  curveType: CurveType;
  amount: RangeSetting;
}
export interface WaveShaper extends BaseModule {
  brand: 'wave_shaper';
  param: WaveShaperParam;
}

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

export type ModuleParam = BiquadFilterParam | DelayParam | GainParam | OscillatorParam | MicInParam | WaveShaperParam | ConvolverParam;
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

export type InOutModule =  BiquadFilter | Delay | Gain | MicIn | Oscillator | WaveShaper | Convolver;
export type InModule = MicIn;
export type ConnectableModule = InModule | InOutModule;


type BaseUpdateModuleEvent<T extends Module, P extends ModuleParam> = { 
  brand: T['brand'];
  module: T;
  param: P;
}

export type UpdateBiquadFilterEvent = BaseUpdateModuleEvent<BiquadFilter, BiquadFilterParam>
export type UpdateWaveShaperEvent = BaseUpdateModuleEvent<WaveShaper, WaveShaperParam>
export type UpdateDelayEvent = BaseUpdateModuleEvent<Delay, DelayParam>
export type UpdateGainEvent = BaseUpdateModuleEvent<Gain, GainParam>
export type UpdateOscillatorEvent = BaseUpdateModuleEvent<Oscillator, OscillatorParam>
export type UpdateConvolverEvent = BaseUpdateModuleEvent<Convolver, ConvolverParam>
export type UpdateModuleEvent = UpdateBiquadFilterEvent
  | UpdateDelayEvent
  | UpdateGainEvent 
  | UpdateOscillatorEvent
  | UpdateConvolverEvent
  | UpdateWaveShaperEvent;


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
