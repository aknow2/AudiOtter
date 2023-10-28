
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
