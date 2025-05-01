
'use server';

/**
 * @fileOverview AI Agent Flow for explaining code using the GitHub Copilot service.
 * This file defines the Genkit flow that orchestrates the code explanation process.
 * It takes code input, calls the underlying service (`getCodeExplanation`), and returns
 * the structured analysis.
 *
 * - explainCode - The primary exported function called by the UI to initiate the flow.
 * - ExplainCodeInput - The Zod schema and TypeScript type for the flow's input.
 * - ExplainCodeOutput - The Zod schema and TypeScript type for the flow's output.
 * - explainCodeFlow - The internal Genkit flow definition.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
// Import the service function and its return type
import { getCodeExplanation, type CodeExplanation } from '@/services/github';

// Define the input schema using Zod
const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
});
// Define the TypeScript type based on the Zod schema
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Define the output schema using Zod, matching the CodeExplanation interface
// This ensures the flow's output structure is validated.
const ExplainCodeOutputSchema = z.object({
  language: z.string().describe('The detected programming language. Defaults to "Unknown".'),
  explanation_markdown: z.string().describe('The detailed explanation of the code, formatted in markdown.'),
  warnings: z.array(z.string()).optional().describe('Potential warnings or general suggestions.'),
  style_suggestions: z.array(z.string()).optional().describe('Suggestions for improving code style and formatting.'),
  code_smells: z.array(z.string()).optional().describe('Identified code smells indicating potential design problems.'),
  security_vulnerabilities: z.array(z.string()).optional().describe('Detected potential security vulnerabilities.'),
  bug_suggestions: z.array(z.object({
    bug: z.string().describe('Potential bug description.'),
    fix_suggestion: z.string().describe('How to fix the bug.'),
  })).optional().describe('Identified potential bugs and suggested fixes.'),
  alternative_suggestions: z.array(z.object({
    description: z.string().describe('Description of the alternative approach.'),
    code: z.string().describe('Alternative code snippet.'),
  })).optional().describe('Alternative ways to write the same logic.'),
});
// Define the TypeScript type based on the Zod schema
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

/**
 * Takes a code snippet and returns a comprehensive analysis using the configured GitHub Copilot service.
 * This acts as the primary entry point called by the frontend components to trigger the code explanation feature.
 * It simply wraps the call to the Genkit flow.
 *
 * @param input - Object containing the codeSnippet. Conforms to ExplainCodeInput.
 * @returns A promise resolving to the CodeExplanation object containing the full analysis. Conforms to ExplainCodeOutput.
 */
export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  // Directly call the defined Genkit flow.
  return explainCodeFlow(input);
}

// Define the Genkit flow using ai.defineFlow
// This specifies the flow's name, input/output schemas, and the core async function.
const explainCodeFlow = ai.defineFlow<
  typeof ExplainCodeInputSchema,
  typeof ExplainCodeOutputSchema // Use the defined output schema
>(
  {
    name: 'explainCodeFlow', // Name for identification in Genkit UI/logs
    inputSchema: ExplainCodeInputSchema, // Link the input schema
    outputSchema: ExplainCodeOutputSchema, // Link the output schema
  },
  async (input): Promise<CodeExplanation> => { // The core logic of the flow
    try {
      // The main work is delegated to the getCodeExplanation service,
      // which handles the actual API call to the GitHub model.
      const result: CodeExplanation = await getCodeExplanation(input.codeSnippet);
      // The result from the service already matches the desired output structure (CodeExplanation).
      return result;
    } catch (error) {
      // Log detailed error information on the server-side
      console.error(`Error in explainCodeFlow for snippet: "${input.codeSnippet.substring(0, 50)}..."`, error);
      // Re-throw the error so it can be caught by the calling component (UI)
      // and displayed to the user. Add context to the error message.
       if (error instanceof Error) {
           throw new Error(`AI Agent Error: ${error.message}`); // Prepend context
       }
       throw new Error("An unexpected error occurred within the AI Agent flow.");
    }
  }
);
