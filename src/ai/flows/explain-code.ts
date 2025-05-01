'use server';

/**
 * @fileOverview AI Agent Flow for explaining code using the GitHub Copilot service.
 *
 * - explainCode - A function that handles the code explanation process.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { getCodeExplanation, type CodeExplanation } from '@/services/github'; // Updated import path

const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Output schema remains the same, matching CodeExplanation interface
const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code.'),
  warnings: z.array(z.string()).optional().describe('Any warnings associated with the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

/**
 * Takes a code snippet and returns an explanation using the configured GitHub Copilot service.
 * This acts as the primary entry point for the code explanation feature.
 * @param input - Object containing the codeSnippet.
 * @returns A promise resolving to the CodeExplanation (explanation and optional warnings).
 */
export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  // Directly call the flow which uses the getCodeExplanation service.
  return explainCodeFlow(input);
}

// Define the Genkit flow
const explainCodeFlow = ai.defineFlow<
  typeof ExplainCodeInputSchema,
  typeof ExplainCodeOutputSchema
>(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input): Promise<CodeExplanation> => {
    try {
      // The core logic is now encapsulated within the getCodeExplanation service.
      const result: CodeExplanation = await getCodeExplanation(input.codeSnippet);
      return result;
    } catch (error) {
      console.error(`Error in explainCodeFlow for snippet: "${input.codeSnippet.substring(0, 50)}..."`, error);
      // Re-throw the error to be handled by the caller (e.g., the UI component)
      // You might want to transform the error into a specific format if needed.
       if (error instanceof Error) {
           throw new Error(`Failed to explain code: ${error.message}`);
       }
       throw new Error("An unexpected error occurred during code explanation.");
    }
  }
);
