export interface Position {
  x: number;
  y: number;
}

type BaseModuleParam<T extends AudioNodeOptions> = Omit<Required<T>,'channelCount' | 'channelCountMode' | 'channelInterpretation'> 
export interface BaseModule {
  id: string;
  position: Position;
  destinationIds: string[];
}

export interface MicIn extends BaseModule {
  brand: 'mic_in';
  source: MediaStreamAudioSourceNode;
}

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

export type ModuleParam = BiquadFilterParam | DelayParam | GainParam;

export type InOutModule =  BiquadFilter | Delay | Gain;
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
export type UpdateModuleEvent = UpdateBiquadFilterEvent | UpdateDelayEvent | UpdateGainEvent;


export interface SpeakerOut extends BaseModule {
  brand: 'speaker_out';
  destination: AudioContext;
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