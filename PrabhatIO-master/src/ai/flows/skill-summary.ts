'use server';
/**
 * @fileOverview Generates a summary of a given skill.
 *
 * - summarizeSkill - A function that generates a summary of a given skill.
 * - SkillSummaryInput - The input type for the summarizeSkill function.
 * - SkillSummaryOutput - The return type for the summarizeSkill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillSummaryInputSchema = z.object({
  skill: z.string().describe('The skill to summarize.'),
});
export type SkillSummaryInput = z.infer<typeof SkillSummaryInputSchema>;

const SkillSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the skill.'),
});
export type SkillSummaryOutput = z.infer<typeof SkillSummaryOutputSchema>;

export async function summarizeSkill(input: SkillSummaryInput): Promise<SkillSummaryOutput> {
  return summarizeSkillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillSummaryPrompt',
  input: {schema: SkillSummaryInputSchema},
  output: {schema: SkillSummaryOutputSchema},
  prompt: `Summarize the following skill in a single sentence: {{{skill}}}`,
});

const summarizeSkillFlow = ai.defineFlow(
  {
    name: 'summarizeSkillFlow',
    inputSchema: SkillSummaryInputSchema,
    outputSchema: SkillSummaryOutputSchema,
  },
  async (input, streamingCallback) => {
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
    // This line should not be reached if maxRetries > 0, but is needed for type safety
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
);
