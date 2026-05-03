'use server';

/**
 * @fileOverview A trading concept explanation AI agent.
 *
 * - tradingExplanation - A function that handles the trading concept explanation process.
 * - TradingExplanationInput - The input type for the tradingExplanation function.
 * - TradingExplanationOutput - The return type for the tradingExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TradingExplanationInputSchema = z.object({
  concept: z.string().describe('The trading concept to explain.'),
});
export type TradingExplanationInput = z.infer<typeof TradingExplanationInputSchema>;

const TradingExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the trading concept.'),
  audio: z.string().describe('The audio explanation of the trading concept in WAV format as a data URI.'),
});
export type TradingExplanationOutput = z.infer<typeof TradingExplanationOutputSchema>;

export async function tradingExplanation(input: TradingExplanationInput): Promise<TradingExplanationOutput> {
  return tradingExplanationFlow(input);
}

const tradingExplanationPrompt = ai.definePrompt({
  name: 'tradingExplanationPrompt',
  input: {schema: TradingExplanationInputSchema},
  output: {schema: z.object({ explanation: z.string() }) }, // Only need explanation here
  prompt: `You are an expert trading educator specializing in explaining complex trading concepts in a simple and easy-to-understand manner.

You will use the concept provided to generate a concise explanation of the trading concept.

Concept: {{{concept}}}
`,
});

async function generateWithRetry(options: any) {
  let retries = 0;
  const maxRetries = 3;

  while(retries < maxRetries) {
    try {
      const result = await ai.generate(options);
      return result;
    } catch (error: any) {
      if (error.message.includes('503') && retries < maxRetries - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } else {
        throw error;
      }
    }
  }
  throw new Error('AI service is currently unavailable for generation. Please try again later.');
}


const tradingExplanationFlow = ai.defineFlow(
  {
    name: 'tradingExplanationFlow',
    inputSchema: TradingExplanationInputSchema,
    outputSchema: TradingExplanationOutputSchema,
  },
  async input => {
    let explanationOutput;
    let retries = 0;
    const maxRetries = 3;

    while(retries < maxRetries) {
        try {
            const { output } = await tradingExplanationPrompt(input);
            explanationOutput = output;
            break;
        } catch (error: any) {
             if (error.message.includes('503') && retries < maxRetries - 1) {
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            } else {
                throw error;
            }
        }
    }
    
    if (!explanationOutput) {
        throw new Error('AI service is currently unavailable for explanation. Please try again later.');
    }

    const textToSpeechResult = await generateWithRetry({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: explanationOutput.explanation ?? 'No explanation available.',
    });

    if (!textToSpeechResult.media) {
      throw new Error('No media returned from TTS.');
    }

    const audioBuffer = Buffer.from(
      textToSpeechResult.media.url.substring(textToSpeechResult.media.url.indexOf(',') + 1),
      'base64'
    );

    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      explanation: explanationOutput!.explanation,
      audio: audioDataUri,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
