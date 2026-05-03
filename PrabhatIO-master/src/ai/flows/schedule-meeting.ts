// src/ai/flows/schedule-meeting.ts
'use server';
/**
 * @fileOverview A flow for scheduling a meeting with the user.
 *
 * - scheduleMeeting - A function that handles the meeting scheduling process.
 * - ScheduleMeetingInput - The input type for the scheduleMeeting function.
 * - ScheduleMeetingOutput - The return type for the scheduleMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleMeetingInputSchema = z.object({
  name: z.string().describe('The name of the person scheduling the meeting.'),
  email: z.string().email().describe('The email address of the person scheduling the meeting.'),
  topic: z.string().describe('The topic of the meeting.'),
  availability: z.string().describe('The available dates and times for the meeting.'),
});
export type ScheduleMeetingInput = z.infer<typeof ScheduleMeetingInputSchema>;

const ScheduleMeetingOutputSchema = z.object({
  confirmation: z.string().describe('A confirmation message for the scheduled meeting.'),
});
export type ScheduleMeetingOutput = z.infer<typeof ScheduleMeetingOutputSchema>;

export async function scheduleMeeting(input: ScheduleMeetingInput): Promise<ScheduleMeetingOutput> {
  return scheduleMeetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleMeetingPrompt',
  input: {schema: ScheduleMeetingInputSchema},
  output: {schema: ScheduleMeetingOutputSchema},
  prompt: `You are a personal assistant helping to schedule meetings.

  A person wants to schedule a meeting with Prabhat Kumar.  Here is the information provided by the person:

  Name: {{{name}}}
  Email: {{{email}}}
  Topic: {{{topic}}}
  Availability: {{{availability}}}

  Create a confirmation message that confirms the meeting details and acknowledges the request. Make the response polite and professional, indicate you will reach out to schedule the meeting.
  `,
});

const scheduleMeetingFlow = ai.defineFlow(
  {
    name: 'scheduleMeetingFlow',
    inputSchema: ScheduleMeetingInputSchema,
    outputSchema: ScheduleMeetingOutputSchema,
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
