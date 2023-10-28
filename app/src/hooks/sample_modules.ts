import { nanoid } from "nanoid";
import { BiquadFilter, Delay, Gain, MicIn, SpeakerOut } from "./types";

export const loadSample = async () => {
  const speakerOut: SpeakerOut = {
    id: nanoid(),
    brand: 'speaker_out',
    position: {
      x: 200,
      y: 300,
    },
    destinations: [],
  }

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
    destinations: [],
  }

  return [micIn, speakerOut];
}
