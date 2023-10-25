import { nanoid } from "nanoid";
import { BiquadFilter, Delay, Gain, MicIn, SpeakerOut } from "./types";

export const loadSample = async (audioContext: AudioContext) => {
  const speakerOut: SpeakerOut = {
    id: nanoid(),
    brand: 'speaker_out',
    position: {
      x: 200,
      y: 300,
    },
    destinations: [],
  }
  const quadFilter: BiquadFilter = {
    id: nanoid(),
    brand: 'biquad_filter',
    position: {
      x: 250,
      y: 200,
    },
    param: {
      frequency: {
        value: 1000,
        min: 10,
        max: 10000,
        step: 1,
      },
      Q: {
        value: 1,
        min: 0.001,
        max: 1000,
        step: 0.001,
      },
      gain: {
        value: 0,
        min: -40,
        max: 40,
        step: 0.1,
      },
      detune: {
        value: 0,
        min: -4800,
        max: 4800,
        step: 1,
      },
      type: 'lowpass',
    },
    destinations: [{ target: 'node', id: speakerOut.id }],
  }

  const delayModule: Delay = {
    id: nanoid(),
    brand: 'delay',
    position: {
      x: 150,
      y: 50,
    },
    param: {
      delayTime: {
        value: 0.1,
        min: 0,
        max: 10,
        step: 0.1,
      },
      maxDelayTime: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
    destinations: [{ target: 'node', id: quadFilter.id }],
  }

  const gain = audioContext.createGain();
  gain.gain.value = 0.1;
  const gainModule: Gain = {
    id: nanoid(),
    brand: 'gain',
    position: {
      x: 300,
      y: 100,
    },
    param: {
      gain: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    destinations: [{ target: 'node', id: delayModule.id }],
  }
  quadFilter.destinations.push({ target: 'node', id: gainModule.id });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const micIn: MicIn = {
    id: nanoid(),
    brand: 'mic_in',
    position: {
      x: 50,
      y: 50,
    },
    param: { 
      stream,
    },
    destinations: [{ target: 'node', id: speakerOut.id }, { target: 'node', id: delayModule.id }],
  }

  return [micIn, speakerOut, quadFilter, delayModule, gainModule];
}
