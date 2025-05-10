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
// import { generate } from 'genkit'; // Removed, ai.generate will be used
import { GenkitError } from 'genkit';


// Define the input schema using Zod
const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
  // Optional: Add lineNumber for error reporting if needed
  // lineNumber: z.number().optional().describe('The line number where an error might be focused, if applicable.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Define the output schema using Zod for Gemini's response.
// This schema now includes fields based on the new feature requests.
const ExplainCodeOutputSchema = z.object({
  language: z.string().optional().describe('The detected programming language. Defaults to "Unknown".'),
  explanation_markdown: z.string().describe('### 🔍 What this code does:\n- Point 1\n- Point 2\n\n### 💡 Summary:\nSummary text.\n'),
  warnings: z.array(z.string()).optional().describe('Potential warnings or general suggestions. Could include "This code contains a potential infinite loop."'),
  style_suggestions: z.array(z.string()).optional().describe('Suggestions for improving code style and formatting. e.g., "Consider renaming variable x to something more meaningful."'),
  code_smells: z.array(z.string()).optional().describe('Identified code smells indicating potential design problems.'),
  security_vulnerabilities: z.array(z.string()).optional().describe('Detected potential security vulnerabilities. e.g., "No input validation detected — risky in user-submitted forms."'),
  bug_suggestions: z.array(z.object({
    bug: z.string().describe('Potential bug description.'),
    fix_suggestion: z.string().describe('How to fix the bug, including line number if applicable.'),
    // line_number: z.number().optional().describe('Line number of the suggested bug fix.')
  })).optional().describe('Identified potential bugs and suggested fixes.'),
  alternative_suggestions: z.array(z.object({
    description: z.string().describe('Description of the alternative approach.'),
    code: z.string().describe('Alternative code snippet.'),
  })).optional().describe('Alternative ways to write the same logic.'),
  // New fields based on user request
  syntax_errors: z.array(z.object({
    error: z.string().describe('Description of the syntax error.'),
    line_number: z.number().optional().describe('Line number of the syntax error.'),
  })).optional().describe('Detected syntax errors in real-time (simulated by LLM analysis).'),
  // output_explanation: z.string().optional().describe('Step-by-step explanation of the code\'s output if it were run (simulated).'), // This is complex for LLM alone
  // code_version_history: z.array(z.string()).optional().describe('Simulated version history or notable changes if applicable (LLM generated).'), // LLM cannot track actual history
  // custom_prompt_suggestions: z.array(z.string()).optional().describe('Suggestions for custom prompts to further tweak or analyze the code.'), // Handled by general interaction flow
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

      const systemPrompt = `You are an AI Code Analyzer and Review Agent. Your task is to analyze the provided code snippet comprehensively.
      Provide the output in a VALID JSON format matching this structure:
      {
        "language": "Detected language (e.g., Python, JavaScript) or Unknown",
        "explanation_markdown": "### 🔍 What this code does:\\n- Step-by-step breakdown of logic.\\n- Function inputs/outputs.\\n- Conditional logic explained.\\n\\n### 💡 Summary:\\nMain purpose of the code.",
        "warnings": ["Optional: Potential infinite loop.", "Optional general warning/suggestion 2"],
        "style_suggestions": ["Optional: Consider renaming variable 'x' to 'userInput'.", "Optional style suggestion 2"],
        "code_smells": ["Optional: Large function, consider refactoring.", "Optional code smell 2"],
        "security_vulnerabilities": ["Optional: No input validation detected.", "Optional SQL injection risk if input is user-controlled and used in DB query."],
        "bug_suggestions": [
          { "bug": "Potential off-by-one error in loop condition.", "fix_suggestion": "Change loop condition from '<=' to '<'." }
        ],
        "alternative_suggestions": [
          { "description": "Using a map function for transformation instead of a for-loop.", "code": "const newArray = oldArray.map(item => item * 2);" }
        ],
        "syntax_errors": [
          { "error": "Missing semicolon at end of statement.", "line_number": 5 }
        ]
      }
      Your analysis should cover:
      - Intent Confirmation: Briefly acknowledge the task (this will be part of your general tone).
      - Language Detection: Detect the programming language.
      - Readable Code Explanation:
        - Start with "🔍 What this code does:" and provide a step-by-step breakdown.
        - Include function definitions, inputs, outputs, and internal logic (steps, conditions).
        - Follow with "💡 Summary:" explaining the main purpose.
      - Agent Warnings & Suggestions: Identify unusual or risky patterns (e.g., "potential infinite loop", "consider renaming variable...").
      - Real-Time Syntax Error Detection (Simulated): If obvious syntax errors are present, list them. Include line numbers if possible.
      - Code Style & Formatting Suggestions: Provide advice on style.
      - Code Smell Detection: Identify potential design problems.
      - Security Vulnerability Checker: Highlight potential security flaws (e.g., "No input validation").
      - AI-Powered Bug Fix Suggestions: If bugs are apparent, describe them and suggest fixes.
      - Alternative Code Suggestions: Offer different ways to write the same logic, including code snippets.

      - If a category has no items, provide an empty array [] for it. If a category is not applicable, omit it or provide an empty array.
      - Ensure all strings within the JSON are properly escaped.
      - DO NOT include any text outside this JSON structure.
      `;

      const userPrompt = `Analyze the following code snippet:\n\n\`\`\`\n${input.codeSnippet}\n\`\`\``;

      const llmResponse = await ai.generate({ 
        model: 'googleai/gemini-2.0-flash-exp', // Updated model
        prompt: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        output: {
            format: "json",
            schema: ExplainCodeOutputSchema,
        },
        config: { 
            safetySettings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
        }
      });
      
      const structuredOutput = llmResponse.output; 

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
      
      if (error instanceof GenkitError) { 
        if (error.message.includes('API key not valid')) {
             throw new GenkitError({
                status: 'UNAUTHENTICATED',
                message: 'Google Gemini API Key is invalid or not authorized. Please check your GOOGLE_GENAI_API_KEY.',
                cause: error,
            });
        }
        // If the error is about model not found, provide a more specific message.
        if (error.status === 'NOT_FOUND' && error.message.includes('Model') && error.message.includes('not found')) {
          throw new GenkitError({
            status: 'NOT_FOUND',
            message: `The specified Google Gemini model was not found. This could be due to an incorrect model name or the API key not having access to it. Current model: 'googleai/gemini-2.0-flash-exp'. Original error: ${error.message}`, // Updated model name in error
            cause: error,
          });
        }
        throw error;
      }
      
      if (error instanceof Error && (error.message.includes('GOOGLE_GENAI_API_KEY') || error.message.includes('plugin is not configured') )) {
        throw new GenkitError({
            status: 'FAILED_PRECONDITION',
            message: 'Google AI plugin is not configured, API key is missing/invalid. Please ensure GOOGLE_GENAI_API_KEY is set correctly in your .env file and the googleAI plugin is initialized.',
            cause: error,
        });
      }

      if (error instanceof Error && error.message.toLowerCase().includes('failed to fetch')) {
        throw new GenkitError({
            status: 'UNAVAILABLE',
            message: 'Failed to connect to the AI service (Gemini). Please check your internet connection, VPN/proxy settings, and ensure the GOOGLE_GENAI_API_KEY is valid and has access to the model.',
            cause: error,
        });
      }
      
      if (error instanceof TypeError && error.message.includes('is not a function')) {
         throw new GenkitError({
            status: 'INTERNAL',
            message: `AI Agent Error (Gemini): A Genkit function was called incorrectly. Original error: ${error.message}`,
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
