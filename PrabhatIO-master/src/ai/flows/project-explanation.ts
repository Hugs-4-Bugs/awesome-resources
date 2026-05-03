'use server';

/**
 * @fileOverview This file defines a Genkit flow for explaining a project.
 *
 * - projectExplanation - A function that explains the technologies used and the challenges overcome in a project.
 * - ProjectExplanationInput - The input type for the projectExplanation function.
 * - ProjectExplanationOutput - The return type for the projectExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectExplanationInputSchema = z.object({
  projectName: z.string().describe('The name of the project to explain.'),
  projectDescription: z.string().describe('A detailed description of the project.'),
});
export type ProjectExplanationInput = z.infer<typeof ProjectExplanationInputSchema>;

const ProjectExplanationOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the project, including technologies used and challenges overcome.'),
});
export type ProjectExplanationOutput = z.infer<typeof ProjectExplanationOutputSchema>;

export async function projectExplanation(input: ProjectExplanationInput): Promise<ProjectExplanationOutput> {
  return projectExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectExplanationPrompt',
  input: {schema: ProjectExplanationInputSchema},
  output: {schema: ProjectExplanationOutputSchema},
  prompt: `You are an AI assistant designed to explain software development projects.

  Given the following project name and description, provide a detailed explanation of the project, including the technologies used and the challenges overcome. Structure your response in a way that is easy to understand for someone with basic technical knowledge.

  Project Name: {{{projectName}}}
  Description: {{{projectDescription}}}
  `,
});

const projectExplanationFlow = ai.defineFlow(
  {
    name: 'projectExplanationFlow',
    inputSchema: ProjectExplanationInputSchema,
    outputSchema: ProjectExplanationOutputSchema,
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
