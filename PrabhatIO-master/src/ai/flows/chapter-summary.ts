
'use server';

/**
 * @fileOverview AI flow for generating a summary of a single book chapter.
 *
 * - summarizeChapter - Generates a tailored summary of a chapter.
 * - SummarizeChapterInput - The input type for the summarizeChapter function.
 * - SummarizeChapterOutput - The return type for the summarizeChapter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChapterInputSchema = z.object({
  chapterTitle: z.string().describe('The title of the chapter.'),
  chapterContent: z.string().describe('The content of the chapter to be summarized.'),
});
export type SummarizeChapterInput = z.infer<typeof SummarizeChapterInputSchema>;

const SummarizeChapterOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the chapter.'),
});
export type SummarizeChapterOutput = z.infer<typeof SummarizeChapterOutputSchema>;

export async function summarizeChapter(input: SummarizeChapterInput): Promise<SummarizeChapterOutput> {
  return summarizeChapterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChapterPrompt',
  input: {schema: SummarizeChapterInputSchema},
  output: {schema: SummarizeChapterOutputSchema},
  prompt: `You are an expert literary critic. You have been asked to write a compelling and insightful summary of a single chapter from the book "The Inner Battle".

  Use the provided chapter title and content to craft a concise summary. The summary should capture the main theme and key message of the chapter in an engaging way.

  Chapter Title: {{{chapterTitle}}}
  Chapter Content:
  {{{chapterContent}}}

  Generate the summary for this chapter now.`,
});

const summarizeChapterFlow = ai.defineFlow(
  {
    name: 'summarizeChapterFlow',
    inputSchema: SummarizeChapterInputSchema,
    outputSchema: SummarizeChapterOutputSchema,
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
