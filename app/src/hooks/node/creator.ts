import { Module } from "../types";
import ir from '../../assets/sounds/ir.wav';

export const createNode = async (module: Module, context: AudioContext): Promise<AudioNode> => {
  switch (module.brand) {
    case 'delay': {
      const node = new DelayNode(context, {
        delayTime: module.param.delayTime.value,
        maxDelayTime: module.param.maxDelayTime.value,
      });
      return node;
    }
    case 'biquad_filter': {
      const node = new BiquadFilterNode(context, {
        Q: module.param.Q.value,
        frequency: module.param.frequency.value,
        detune: module.param.detune.value,
        gain: module.param.gain.value,
        type: module.param.type,
      });
      return node;
    }
    case 'gain': {
      const node = new GainNode(context, {
        gain: module.param.gain.value,
      });
      return node;
    }
    case 'oscillator': {
      const node = new OscillatorNode(context, {
        type: module.param.type,
        frequency: module.param.frequency.value,
        detune: module.param.detune.value,
      });
      return node;
    }
    case "mic_in": {
      const node = context.createMediaStreamSource(module.param.stream);
      return node;
    }
    case "wave_shaper": {
      const node = new WaveShaperNode(context, {
        curve: module.param.curve,
        oversample: module.param.oversample,
      });
      return node;
    }
    case "convolver": {
      const res = await fetch(ir);
      const arrayBuffer = await res.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      const node = new ConvolverNode(context, {
        buffer: audioBuffer,
        disableNormalization: false,
      });
      return node;
    }
    case "recording": {
      const node = context.createMediaStreamDestination();
      return node;
    }
    case "speaker_out": {
      throw new Error("speaker_out is not supported");
    }
  }
}
