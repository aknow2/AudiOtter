export interface Position {
  x: number;
  y: number;
}

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

export interface Delay extends BaseModule {
  brand: 'delay';
  source: DelayNode;
}

export type SourceModule = MicIn | BiquadFilter | Delay;

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