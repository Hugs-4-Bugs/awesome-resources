import wav from 'wav';
import { ai } from './genkit';


export async function textToSpeech(text: string): Promise<string> {
  try {
    const { media } = await ai.generate({
      // Using the specialized TTS model found in the list
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) throw new Error('No audio returned from Gemini');

    const pcm = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    return toWav(pcm);
  } catch (error: any) {
    console.error("TTS Genkit Error Details:", JSON.stringify(error, null, 2));
    if (error.response) {
        console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const chunks: Buffer[] = [];
    writer.on('data', (c) => chunks.push(c));
    writer.on('end', () =>
      resolve(Buffer.concat(chunks).toString('base64'))
    );

    writer.write(pcmData);
    writer.end();
  });
}
