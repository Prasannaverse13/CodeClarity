
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

// Updated Output schema to match the enhanced CodeExplanation interface from github service
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
  flowchart_mermaid: z.string().optional().describe('Mermaid syntax for a flowchart representing the code logic.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>; // Matches the updated CodeExplanation interface

/**
 * Takes a code snippet and returns a comprehensive analysis using the configured GitHub Copilot service.
 * This acts as the primary entry point for the code explanation feature.
 * @param input - Object containing the codeSnippet.
 * @returns A promise resolving to the CodeExplanation object containing the full analysis.
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
      // The core logic is encapsulated within the getCodeExplanation service.
      const result: CodeExplanation = await getCodeExplanation(input.codeSnippet);
      // The result from the service already matches the desired output structure.
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

