
'use server';

/**
 * @fileOverview AI flow for a general chat assistant about Prabhat Kumar.
 *
 * - generalChat - Answers questions about Prabhat Kumar based on provided context.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralChatInputSchema = z.object({
  query: z.string().describe('The user\'s question about Prabhat Kumar.'),
  context: z.string().describe('The context information about Prabhat Kumar from the website.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalChatPrompt',
  input: {schema: GeneralChatInputSchema},
  output: {schema: GeneralChatOutputSchema},
  prompt: `You are a friendly and professional AI assistant for Prabhat Kumar, the founder of QuantumFusion Solutions. Your goal is to answer questions about him based ONLY on the context provided below. Do not make up information. If the answer is not in the context, say that you don't have information on that topic.

  Keep your answers concise and helpful.

  Context:
  {{{context}}}

  User's Question:
  "{{{query}}}"

  Answer:`,
});

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input) => {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        if (error.message.includes('503') && retries < maxRetries - 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        } else {
          throw error;
        }
      }
    }
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
);
