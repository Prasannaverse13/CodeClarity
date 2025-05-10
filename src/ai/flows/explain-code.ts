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
  code_smells: z.array(z.string()).optional().describe('Identified code smells indicating potential design problems. e.g., "Function is too long, consider breaking it down."'),
  security_vulnerabilities: z.array(z.string()).optional().describe('Detected potential security vulnerabilities. e.g., "No input validation detected — risky in user-submitted forms." or "Potential for SQL injection if input is not sanitized."'),
  bug_suggestions: z.array(z.object({
    bug: z.string().describe('Potential bug description. e.g., "Possible null pointer dereference if object is not initialized."'),
    fix_suggestion: z.string().describe('How to fix the bug, including line number if applicable. e.g., "Add a null check before accessing object properties."'),
    // line_number: z.number().optional().describe('Line number of the suggested bug fix.')
  })).optional().describe('Identified potential bugs and suggested fixes.'),
  alternative_suggestions: z.array(z.object({
    description: z.string().describe('Description of the alternative approach. e.g., "Using a ternary operator for concise conditional assignment."'),
    code: z.string().describe('Alternative code snippet. e.g., "const result = condition ? value1 : value2;"'),
  })).optional().describe('Alternative ways to write the same logic.'),
  syntax_errors: z.array(z.object({
    error: z.string().describe('Description of the syntax error.'),
    line_number: z.number().optional().describe('Line number of the syntax error.'),
  })).optional().describe('Detected syntax errors in real-time (simulated by LLM analysis).'),
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
        "warnings": ["Optional: General warning 1.", "Optional general warning 2"],
        "style_suggestions": ["Optional: Style suggestion 1.", "Optional: Formatting advice 2"],
        "code_smells": ["Optional: Identified code smell 1 (e.g., Long method).", "Optional code smell 2"],
        "security_vulnerabilities": ["Optional: Security vulnerability 1 (e.g., XSS risk).", "Optional vulnerability 2 (e.g., Hardcoded secret)."],
        "bug_suggestions": [
          { "bug": "Potential bug description 1.", "fix_suggestion": "Suggested fix for bug 1." },
          { "bug": "Potential bug description 2.", "fix_suggestion": "Suggested fix for bug 2." }
        ],
        "alternative_suggestions": [
          { "description": "Alternative approach description 1.", "code": "Alternative code snippet 1;" },
          { "description": "Alternative approach description 2.", "code": "Alternative code snippet 2;" }
        ],
        "syntax_errors": [
          { "error": "Missing semicolon at end of statement.", "line_number": 5 }
        ]
      }
      Your analysis should cover ALL of the following categories:
      - Intent Confirmation: Briefly acknowledge the task (this will be part of your general tone).
      - Language Detection: Detect the programming language.
      - Readable Code Explanation:
        - Start with "🔍 What this code does:" and provide a step-by-step breakdown.
        - Include function definitions, inputs, outputs, and internal logic (steps, conditions).
        - Follow with "💡 Summary:" explaining the main purpose.
      - General Warnings & Suggestions: Identify unusual or risky patterns or offer general advice.
      - Style & Formatting Suggestions: Provide advice on improving code style and formatting.
      - Code Smell Detection: Identify potential design problems or anti-patterns.
      - Security Vulnerability Checks: Highlight potential security flaws (e.g., XSS, SQLi, hardcoded secrets, no input validation).
      - Potential Bug Identification & Fix Suggestions: If bugs are apparent, describe them and suggest fixes. Include line numbers if possible.
      - Alternative Code Approaches: Offer different ways to write the same logic, including code snippets.
      - Real-Time Syntax Error Detection (Simulated): If obvious syntax errors are present, list them. Include line numbers if possible.

      - If a category has no items, provide an empty array [] for it. DO NOT omit any category.
      - Ensure all strings within the JSON are properly escaped.
      - DO NOT include any text outside this JSON structure.
      `;

      const userPrompt = `Analyze the following code snippet:\n\n\`\`\`\n${input.codeSnippet}\n\`\`\``;

      const llmResponse = await ai.generate({ 
        model: 'googleai/gemini-2.0-flash-exp',
        messages: [ 
            { role: 'system', content: [{ text: systemPrompt }] },
            { role: 'user', content: [{ text: userPrompt }] }
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
      
      // Attempt to parse, even if the model might not perfectly adhere.
      // Zod will validate against the schema.
      let parsedOutput: ExplainCodeOutput;
      try {
        // If the output is already an object (because Genkit parsed it based on output.format = "json")
        if (typeof structuredOutput === 'object' && structuredOutput !== null) {
            parsedOutput = structuredOutput as ExplainCodeOutput; // Cast, Zod will validate next
        } else if (typeof structuredOutput === 'string') {
            // This case might occur if Genkit's auto-parsing based on format="json" isn't perfect
            // or if the LLM wraps the JSON in something unexpected.
            // Try to extract JSON from potential markdown code blocks.
            const jsonMatch = structuredOutput.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                parsedOutput = JSON.parse(jsonMatch[1]);
            } else {
                 // Assume it's a plain JSON string if no markdown block found
                parsedOutput = JSON.parse(structuredOutput);
            }
        } else {
            throw new Error("Unexpected output format from LLM. Expected object or JSON string.");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini output as JSON:", parseError, "Raw Output:", structuredOutput);
        throw new GenkitError({
            status: 'INTERNAL',
            message: `AI model output was not valid JSON. ${ (parseError as Error).message }`
        });
      }
      
      const validationResult = ExplainCodeOutputSchema.safeParse(parsedOutput);
      if (!validationResult.success) {
        console.error("Gemini output failed Zod validation:", validationResult.error.issues, "Parsed Output:", parsedOutput);
        // Try to return the partially valid data if explanation_markdown is present, otherwise throw
        if (parsedOutput.explanation_markdown) {
            toast({
                title: "Partial Analysis",
                description: "AI model output had some inconsistencies but core explanation is available. Some sections might be missing.",
                variant: "default" // Or a custom "warning" variant
            });
            // Fill missing array fields with empty arrays to prevent crashes
            const partialData = validationResult.error.issues.reduce((acc, issue) => {
                const path = issue.path.join('.');
                if (ExplainCodeOutputSchema.shape.hasOwnProperty(path) && Array.isArray((ExplainCodeOutputSchema.shape as any)[path]._def.type)) {
                    (acc as any)[path] = [];
                }
                return acc;
            }, { ...parsedOutput });
             return ExplainCodeOutputSchema.parse(partialData); // Re-parse with defaults
        }

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
            message: `The specified Google Gemini model was not found. This could be due to an incorrect model name or the API key not having access to it. Current model: 'googleai/gemini-2.0-flash-exp'. Original error: ${error.message}`,
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

// Helper function for toast (cannot be used directly in 'use server' top-level)
// This is a placeholder. Actual toast calls should be on the client-side.
function toast(options: { title: string; description: string; variant?: string }) {
    console.warn(`Server-side toast attempt: ${options.title} - ${options.description}`);
}
