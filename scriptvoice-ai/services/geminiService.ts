// Backend API URL - can be moved to env later
const API_URL = 'http://localhost:4000/tts';

export async function generateSpeechForText(
  text: string,
  _voice: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'TTS Request failed');
    }

    const { audio } = await res.json();

    if (!audio) {
        throw new Error("No audio data received from backend");
    }

    const binary = atob(audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return await audioContext.decodeAudioData(bytes.buffer);
  } catch (error) {
    console.error("Frontend TTS Error:", error);
    throw error;
  }
}
