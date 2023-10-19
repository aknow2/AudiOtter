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

export type ModuleParam = BiquadFilterParam | DelayParam;

export type InOutModule =  BiquadFilter | Delay;
export type SourceModule = MicIn | BiquadFilter | Delay;


export interface UpdateBiquadFilterEvent {
  brand: 'biquad_filter';
  module: BiquadFilter;
  param: BiquadFilterParam;
}

export interface UpdateDelayEvent {
  brand: 'delay';
  module: Delay;
  param: DelayParam;
}

export type UpdateModuleEvent = UpdateBiquadFilterEvent | UpdateDelayEvent;


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

export type DestinationModule = SpeakerOut;

export type DestinationBrand = DestinationModule['brand'];
export type SourceBrand = SourceModule['brand'];
export type ModuleBrand = DestinationBrand | SourceBrand;

export type Module = SourceModule | DestinationModule;
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