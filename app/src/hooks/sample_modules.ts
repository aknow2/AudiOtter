import { nanoid } from "nanoid";
import { MicIn, SpeakerOut } from "./types";

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

  const stream = await navigator.mediaDevices.getUserMedia({ audio: {
    deviceId: 'default',
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  } });
  const mic = stream.getAudioTracks().find(track => track.kind === 'audioinput')?.kind ?? 'true';
  const speaker = stream.getAudioTracks().find(track => track.kind === 'audiooutput')?.kind ?? 'true';
  const micIn: MicIn = {
    id: nanoid(),
    brand: 'mic_in',
    position: {
      x: 50,
      y: 50,
    },
    param: { 
      stream,
      mic,
      speaker,
    },
    destinations: [],
  }

  return [micIn, speakerOut];
}
