
'use server';

/**
 * @fileOverview AI flow for generating a summary of the book "The Inner Battle".
 *
 * - summarizeBook - Generates a tailored summary of the book based on its content.
 * - SummarizeBookInput - The input type for the summarizeBook function.
 * - SummarizeBookOutput - The return type for the summarizeBook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBookInputSchema = z.object({
  bookContent: z.string().describe('The full content of the book, including chapter details, preface, and author bio.'),
});
export type SummarizeBookInput = z.infer<typeof SummarizeBookInputSchema>;

const SummarizeBookOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the book.'),
});
export type SummarizeBookOutput = z.infer<typeof SummarizeBookOutputSchema>;

export async function summarizeBook(input: SummarizeBookInput): Promise<SummarizeBookOutput> {
  return summarizeBookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBookPrompt',
  input: {schema: SummarizeBookInputSchema},
  output: {schema: SummarizeBookOutputSchema},
  prompt: `You are an expert literary critic. You have been asked to write a compelling and insightful summary of the book "The Inner Battle".

  Use the provided content below, which includes the preface, chapter summaries, and author details, to craft a comprehensive summary.

  The summary should:
  1.  Start with a strong opening that captures the essence of the book.
  2.  Explain the main themes and the journey the reader will embark upon.
  3.  Touch upon key concepts from the chapters without just listing them.
  4.  Conclude with a powerful statement about the book's value to the reader.
  5.  Maintain an engaging and professional tone.

  Book Content:
  {{{bookContent}}}

  Generate the summary now.`,
});

const summarizeBookFlow = ai.defineFlow(
  {
    name: 'summarizeBookFlow',
    inputSchema: SummarizeBookInputSchema,
    outputSchema: SummarizeBookOutputSchema,
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
