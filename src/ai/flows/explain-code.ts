
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
import { getCodeExplanation, type CodeExplanation } from '@/services/github';

const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Updated Output schema to include language and markdown explanation
const ExplainCodeOutputSchema = z.object({
  language: z.string().optional().describe('The detected programming language.'),
  explanation_markdown: z.string().describe('The explanation of the code, formatted in markdown.'),
  warnings: z.array(z.string()).optional().describe('Any warnings or suggestions associated with the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>; // Matches the updated CodeExplanation interface

/**
 * Takes a code snippet and returns an explanation using the configured GitHub Copilot service.
 * This acts as the primary entry point for the code explanation feature.
 * @param input - Object containing the codeSnippet.
 * @returns A promise resolving to the CodeExplanation (explanation, language, and optional warnings).
 */
export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  // Directly call the flow which uses the getCodeExplanation service.
  return explainCodeFlow(input);
}

// Define the Genkit flow
const explainCodeFlow = ai.defineFlow<
  typeof ExplainCodeInputSchema,
  typeof ExplainCodeOutputSchema // Use the updated output schema
>(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema, // Use the updated output schema
  },
  async (input): Promise<CodeExplanation> => { // Return type matches the service's output
    try {
      // The core logic is now encapsulated within the getCodeExplanation service.
      const result: CodeExplanation = await getCodeExplanation(input.codeSnippet);
      return result;
    } catch (error) {
      console.error(`Error in explainCodeFlow for snippet: "${input.codeSnippet.substring(0, 50)}..."`, error);
      // Re-throw the error to be handled by the caller (e.g., the UI component)
       if (error instanceof Error) {
           throw new Error(`Failed to explain code: ${error.message}`);
       }
       throw new Error("An unexpected error occurred during code explanation.");
    }
  }
);

