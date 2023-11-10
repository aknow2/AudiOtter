import { NodeMap, Recording } from "../types";

const getWritableStream = async () => {
  const options = {
      type: 'open-directory'
  };
  const dir = await (window as any).showDirectoryPicker(options)
  const file: FileSystemFileHandle = await dir.getFileHandle(getCurrentTimeFileName(), { create: true })
  return file.createWritable()
}

const getCurrentTimeFileName = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.ogg`;
}

export const createRecordingInvoker = (streamNode: MediaStreamAudioDestinationNode) => async () => {
  const writableStream = await getWritableStream();

  const mediaRecorder = new MediaRecorder(streamNode.stream);
  mediaRecorder.ondataavailable = (e) => {
    writableStream.write(e.data);
  };

  mediaRecorder.onerror = async (e) => {
    console.error(e);
    await writableStream.abort();
  }
  mediaRecorder.onstop = async () => {
    await writableStream.close();
  }

  mediaRecorder.start(1000);
  return async () => {
    mediaRecorder.stop();
  };
}

export type StopRecording = () => Promise<void>;


export const createRecorder = (nodeMap: NodeMap) => {
  const stoppers = new Map<string, () => Promise<void>>();

  const start = async (module: Recording) => {
    const node = nodeMap.get(module.id) as MediaStreamAudioDestinationNode;
    const invoker = await createRecordingInvoker(node)
    const stopper = await invoker();
    stoppers.set(module.id, stopper);
  }

  const stop = async (module: Recording) => {
    const stopper = stoppers.get(module.id);
    stoppers.delete(module.id);
    if (stopper) {
      await stopper();
    }
  }

  return {
    start,
    stop,
  }
}

