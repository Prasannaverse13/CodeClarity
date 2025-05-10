// src/ai/flows/sensay-code-insight-flow.ts
'use server';

/**
 * @fileOverview AI Agent Flow for getting code insights using the Sensay Wisdom Engine.
 * This file defines the Genkit flow that orchestrates interaction with the Sensay API.
 *
 * - getSensayCodeInsight - The primary exported function called by the UI.
 * - SensayCodeInsightInput - The Zod schema and TypeScript type for the flow's input.
 * - SensayCodeInsightOutput - The Zod schema and TypeScript type for the flow's output.
 * - sensayCodeInsightFlow - The internal Genkit flow definition.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { getSensayInteraction, type SensayInteractionResponse } from '@/services/sensay';

// Define the input schema using Zod
const SensayCodeInsightInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to get insights for.'),
  // Optional: Add a specific question or prompt for Sensay if needed
  // question: z.string().optional().describe('A specific question to ask Sensay about the code.'),
});
export type SensayCodeInsightInput = z.infer<typeof SensayCodeInsightInputSchema>;

// Define the output schema using Zod
const SensayCodeInsightOutputSchema = z.object({
  insight: z
    .string()
    .describe('The insight or analysis provided by Sensay regarding the code snippet.'),
  rawSensayResponse: z.any().optional().describe('The raw response from the Sensay API for debugging or further processing.'),
});
export type SensayCodeInsightOutput = z.infer<typeof SensayCodeInsightOutputSchema>;

/**
 * Takes a code snippet and returns insights from the Sensay Wisdom Engine.
 *
 * @param input - Object containing the codeSnippet. Conforms to SensayCodeInsightInput.
 * @returns A promise resolving to an object containing the insight from Sensay. Conforms to SensayCodeInsightOutput.
 */
export async function getSensayCodeInsight(
  input: SensayCodeInsightInput
): Promise<SensayCodeInsightOutput> {
  return sensayCodeInsightFlow(input);
}

// Define the Genkit flow
const sensayCodeInsightFlow = ai.defineFlow<
  typeof SensayCodeInsightInputSchema,
  typeof SensayCodeInsightOutputSchema
>(
  {
    name: 'sensayCodeInsightFlow',
    inputSchema: SensayCodeInsightInputSchema,
    outputSchema: SensayCodeInsightOutputSchema,
  },
  async (input): Promise<SensayCodeInsightOutput> => {
    try {
      // Construct the prompt/input for Sensay
      const sensayInputText = `Provide insights on the following code snippet. Focus on identifying key concepts, potential challenges, design patterns, or areas for deeper understanding related to this code:\n\n\`\`\`\n${input.codeSnippet}\n\`\`\``;

      // Call the Sensay service
      const sensayResponse: SensayInteractionResponse = await getSensayInteraction(sensayInputText);

      let insightText = 'Sensay provided no textual output or the output format was unexpected.';
      if (sensayResponse.output?.type === 'text' && sensayResponse.output.content) {
        insightText = sensayResponse.output.content;
      } else if (sensayResponse.output) {
        // If output is not simple text, stringify it for now.
        // In a more advanced scenario, you'd parse structured output.
        insightText = `Sensay provided a non-textual output: ${JSON.stringify(sensayResponse.output, null, 2)}`;
      } else if (sensayResponse.status === 'completed' && !sensayResponse.output) {
        insightText = 'Sensay interaction completed but no output was generated.';
      }


      if (sensayResponse.status !== 'completed') {
        console.warn(`Sensay interaction did not complete successfully. Status: ${sensayResponse.status}`, sensayResponse);
        // Potentially throw an error or return a specific message
        // For now, we pass through the (potentially partial) insight
      }
      
      if (sensayResponse.error) {
        console.error('Sensay interaction returned an error:', sensayResponse.error);
        // Overwrite insightText if there's a clear error message from Sensay
        insightText = `Sensay error: ${sensayResponse.error.message || JSON.stringify(sensayResponse.error)}`;
      }


      return {
        insight: insightText,
        rawSensayResponse: sensayResponse, // Optionally include the full response for debugging
      };
    } catch (error) {
      console.error(`Error in sensayCodeInsightFlow for snippet: "${input.codeSnippet.substring(0, 50)}..."`, error);
      if (error instanceof Error) {
        throw new Error(`Sensay AI Agent Error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred within the Sensay AI Agent flow.');
    }
  }
);