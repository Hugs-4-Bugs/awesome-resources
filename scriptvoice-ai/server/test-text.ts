import 'dotenv/config';
import { gemini15Flash } from '@genkit-ai/googleai';
import { ai } from './genkit';

async function run() {
  try {
    console.log("Testing Gemini 1.5 Flash Text Generation...");
    const result = await ai.generate({
      model: gemini15Flash,
      prompt: 'Hello, are you working?',
    });
    console.log("Success:", result.text);
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
       console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
