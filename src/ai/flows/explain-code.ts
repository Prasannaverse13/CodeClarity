
'use server';

/**
 * @fileOverview AI Agent Flow for explaining code using Google Gemini.
 * This file defines the Genkit flow that orchestrates the code explanation process.
 * It takes code input, calls the Gemini model via ai.generate(), and returns
 * the structured analysis.
 *
 * - explainCode - The primary exported function called by the UI to initiate the flow.
 * - ExplainCodeInput - The Zod schema and TypeScript type for the flow's input.
 * - ExplainCodeOutput - The Zod schema and TypeScript type for the flow's output.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { generate } from 'genkit';
import { GenkitError } from 'genkit';


// Define the input schema using Zod
const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Define the output schema using Zod for Gemini's response.
const ExplainCodeOutputSchema = z.object({
  language: z.string().optional().describe('The detected programming language. Defaults to "Unknown".'),
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
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;


/**
 * Takes a code snippet and returns a comprehensive analysis using Google Gemini.
 *
 * @param input - Object containing the codeSnippet. Conforms to ExplainCodeInput.
 * @returns A promise resolving to the analysis. Conforms to ExplainCodeOutput.
 */
export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

// Define the Genkit flow using ai.defineFlow
const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeGeminiFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input): Promise<ExplainCodeOutput> => {
    try {
      // The ai-instance.ts already handles conditional plugin initialization.
      // If GOOGLE_GENAI_API_KEY is not set, the googleAI plugin won't be loaded,
      // and any attempt to use a googleai model will fail, which is handled below.
      // The check `!ai.registry.plugin('googleai')` is from Genkit v0.x and will cause an error.

      const systemPrompt = `You are an AI Code Analyzer. Your task is to analyze the provided code snippet.
      Provide the output in a VALID JSON format matching this structure:
      {
        "language": "Detected language (e.g., Python, JavaScript) or Unknown",
        "explanation_markdown": "### 🔍 What this code does:\\n- Point 1\\n- Point 2\\n\\n### 💡 Summary:\\nSummary text.\\n",
        "warnings": ["Optional general warning/suggestion 1", "Optional warning/suggestion 2"],
        "style_suggestions": ["Optional style suggestion 1"],
        "code_smells": ["Optional code smell 1"],
        "security_vulnerabilities": ["Optional security vulnerability 1"],
        "bug_suggestions": [
          { "bug": "Potential bug description", "fix_suggestion": "How to fix it" }
        ],
        "alternative_suggestions": [
          { "description": "Alternative 1 description", "code": "Alternative code snippet 1" }
        ]
      }
      - Detect the programming language.
      - Provide a step-by-step explanation of what the code does using markdown. Structure: ### 🔍 What this code does:, ### 💡 Summary:.
      - List any style and formatting suggestions.
      - Identify code smells.
      - Check for security vulnerabilities.
      - Suggest potential bug fixes.
      - Offer alternative ways to write the same logic, including code snippets.
      - List general warnings or suggestions.
      - If a category has no items, provide an empty array [] for it. If a category is not applicable, omit it or provide an empty array.
      - Ensure all strings within the JSON are properly escaped.
      - DO NOT include any text outside this JSON structure.
      `;

      const userPrompt = `Analyze the following code snippet:\n\n\`\`\`\n${input.codeSnippet}\n\`\`\``;

      const llmResponse = await generate({
        model: 'googleai/gemini-1.5-flash-latest', // Ensure this model is appropriate and available
        prompt: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        output: {
            format: "json",
            schema: ExplainCodeOutputSchema,
        },
        config: { // Added safety settings to be less restrictive for code analysis
            safetySettings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, // Relaxed slightly
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, // Relaxed slightly
            ],
        }
      });
      
      const structuredOutput = llmResponse.output();

      if (!structuredOutput) {
        console.error("Gemini response was empty or not in the expected format.", llmResponse.usage());
        throw new GenkitError({
            status: 'INTERNAL',
            message: 'AI model returned an empty or unparsable response.'
        });
      }
      
      const validationResult = ExplainCodeOutputSchema.safeParse(structuredOutput);
      if (!validationResult.success) {
        console.error("Gemini output failed Zod validation:", validationResult.error.issues, "Raw Output:", structuredOutput);
        throw new GenkitError({
            status: 'INTERNAL',
            message: `AI model output did not match the expected structure: ${validationResult.error.message}`
        });
      }

      return validationResult.data;

    } catch (error) {
      console.error(`Error in explainCodeGeminiFlow for snippet: "${input.codeSnippet.substring(0, 50)}..."`, error);
      if (error instanceof GenkitError) throw error; // Re-throw Genkit errors directly
      
      // Check if the error message indicates a missing API key or plugin issue
      if (error instanceof Error && (error.message.includes('GOOGLE_GENAI_API_KEY') || error.message.includes('plugin is not configured'))) {
        throw new GenkitError({
            status: 'FAILED_PRECONDITION',
            message: 'Google AI plugin is not configured or API key is missing. Please ensure GOOGLE_GENAI_API_KEY is set in your .env file.',
            cause: error,
        });
      }

      if (error instanceof Error) {
        throw new GenkitError({
            status: 'INTERNAL',
            message: `AI Agent Error (Gemini): ${error.message}`,
            cause: error,
        });
      }
      throw new GenkitError({
        status: 'UNKNOWN',
        message: "An unexpected error occurred within the Gemini AI Agent flow."
      });
    }
  }
);
