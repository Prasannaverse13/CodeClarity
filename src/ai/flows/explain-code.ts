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
import { GenkitError } from 'genkit';
import { toast } from "@/hooks/use-toast"; // Ensure toast can be called from server component context if needed, or move calls to client


// Define the input schema using Zod
const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

// Define the output schema using Zod for Gemini's response.
const ExplainCodeOutputSchema = z.object({
  language: z.string().optional().describe('The detected programming language. Defaults to "Unknown".'),
  explanation_markdown: z.string().describe('Comprehensive Analysis: A step-by-step breakdown of what the code does, including its purpose and logic flow (e.g., "### 🔍 What this code does:\n- Point 1\n- Point 2\n\n### 💡 Summary:\nSummary text.\n").'),
  style_suggestions: z.array(z.string()).optional().describe('Style & Formatting Suggestions: Actionable advice to improve code style, readability, and adherence to common conventions (e.g., "Consider renaming variable `x` to `userInput` for clarity.").'),
  code_smells: z.array(z.string()).optional().describe('Code Smell Detection: Identification of potential design issues or anti-patterns in the code that might indicate deeper problems (e.g., "Function `calculateTotal` is too long and handles multiple responsibilities, consider breaking it down.").'),
  security_vulnerabilities: z.array(z.string()).optional().describe('Security Vulnerability Checks: Potential security weaknesses or vulnerabilities identified in the code (e.g., "No input validation detected for `queryParam`, potentially leading to XSS if rendered directly." or "Potential for SQL injection if `userInput` is not sanitized before database query.").'),
  bug_suggestions: z.array(z.object({
    bug: z.string().describe('Description of the potential bug (e.g., "Possible null pointer dereference if `userObject` is not initialized before accessing `userObject.name`.").'),
    fix_suggestion: z.string().describe('A concrete suggestion on how to fix the identified bug (e.g., "Add a null check for `userObject` before accessing its properties: `if (userObject) { ... }`.").'),
    // line_number: z.number().optional().describe('Approximate line number of the potential bug.') // Keeping line_number optional
  })).optional().describe('Potential Bug Identification & Fix Suggestions: Specific bugs the AI suspects might exist, along with actionable suggestions for fixing them.'),
  alternative_suggestions: z.array(z.object({
    description: z.string().describe('A brief explanation of the alternative approach (e.g., "Using a ternary operator for concise conditional assignment.").'),
    code: z.string().describe('A code snippet demonstrating the alternative approach (e.g., "const result = condition ? value1 : value2;").'),
  })).optional().describe('Alternative Code Approaches: Different ways to write the same logic, potentially improving efficiency, readability, or using different programming paradigms.'),
  warnings: z.array(z.string()).optional().describe('General Warnings & Suggestions: Other observations, general advice, or potential areas for improvement not covered in more specific categories (e.g., "The code uses a deprecated library function `old_function()`." or "Consider adding comments to explain complex logic sections.").'),
  syntax_errors: z.array(z.object({
    error: z.string().describe('Description of the syntax error.'),
    line_number: z.number().optional().describe('Line number of the syntax error.'),
  })).optional().describe('Detected syntax errors in the code (simulated by LLM analysis).'),
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
      const systemPrompt = `You are an AI Code Analyzer and Review Agent. Your task is to analyze the provided code snippet comprehensively.
      Provide the output in a VALID JSON format matching this exact structure, including all specified keys.
      If a category has no specific items to report for the given code, provide an empty array [] as the value for that key. DO NOT omit any keys.

      JSON Structure Example:
      {
        "language": "Detected language (e.g., Python, JavaScript)",
        "explanation_markdown": "### 🔍 What this code does:\\n- Step-by-step breakdown of logic.\\n- Function inputs/outputs.\\n\\n### 💡 Summary:\\nMain purpose of the code.",
        "style_suggestions": ["Example style suggestion 1.", "Example style suggestion 2."],
        "code_smells": ["Example code smell 1.", "Example code smell 2."],
        "security_vulnerabilities": ["Example security vulnerability 1.", "Example security vulnerability 2."],
        "bug_suggestions": [
          { "bug": "Example potential bug.", "fix_suggestion": "Example fix suggestion." }
        ],
        "alternative_suggestions": [
          { "description": "Example alternative approach.", "code": "Example alternative code snippet;" }
        ],
        "warnings": ["Example general warning 1.", "Example general warning 2."],
        "syntax_errors": [
          { "error": "Example syntax error.", "line_number": 1 }
        ]
      }

      Your analysis MUST cover ALL of the following categories, providing specific feedback for each based on the input code.
      The output JSON MUST contain a key for each category listed below.
      If a category has no specific items to report for the given code, provide an empty array [] as the value for that key. DO NOT omit any keys from the JSON response.

      Analysis Categories (Ensure each corresponding key is in the JSON output):
      1.  Language Detection (key: "language"): Detect the programming language.
      2.  Comprehensive Analysis (key: "explanation_markdown"): Provide a detailed step-by-step breakdown of the code's logic, inputs, outputs, and its overall purpose (summary).
      3.  Style & Formatting Suggestions (key: "style_suggestions"): Offer advice on improving code style, formatting, and readability (e.g., naming conventions, consistent indentation).
      4.  Code Smell Detection (key: "code_smells"): Identify potential design problems, anti-patterns, or areas where the code could be refactored for better maintainability or structure.
      5.  Security Vulnerability Checks (key: "security_vulnerabilities"): Highlight potential security flaws or risks (e.g., XSS, SQLi, hardcoded secrets, lack of input validation).
      6.  Potential Bug Identification & Fix Suggestions (key: "bug_suggestions"): If bugs are apparent or suspected, describe them and suggest specific fixes. Include line numbers if applicable.
      7.  Alternative Code Approaches (key: "alternative_suggestions"): Suggest different ways to write the same logic, possibly offering improvements in efficiency, conciseness, or adherence to best practices. Include code snippets for alternatives.
      8.  General Warnings & Suggestions (key: "warnings"): Provide any other general warnings, advice, or suggestions that don't fit into the above categories (e.g., use of deprecated features, performance considerations).
      9.  Syntax Errors (key: "syntax_errors"): If obvious syntax errors are present, list them. Include line numbers if possible. (This is a bonus, aim to provide it if clear syntax issues exist).

      - Ensure all strings within the JSON are properly escaped (e.g., newlines as \\n).
      - Your entire response MUST be ONLY the JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON structure itself.
      `;

      const userPrompt = `Analyze the following code snippet:\n\n\`\`\`\n${input.codeSnippet}\n\`\`\``;

      const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Using Gemini 2.0 Flash Experimental
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
        // Client-side toast is preferred. This is a server-side log.
        // A mechanism to pass this specific error to client for toast would be ideal.
        throw new GenkitError({
            status: 'INTERNAL',
            message: 'AI model returned an empty or unparsable response.'
        });
      }

      let parsedOutput: ExplainCodeOutput;
      try {
        if (typeof structuredOutput === 'object' && structuredOutput !== null) {
            parsedOutput = structuredOutput as ExplainCodeOutput;
        } else if (typeof structuredOutput === 'string') {
            const jsonMatch = structuredOutput.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                parsedOutput = JSON.parse(jsonMatch[1]);
            } else {
                parsedOutput = JSON.parse(structuredOutput);
            }
        } else {
            throw new Error("Unexpected output format from LLM. Expected object or JSON string.");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini output as JSON:", parseError, "Raw Output:", structuredOutput);
        throw new GenkitError({
            status: 'INTERNAL',
            message: `AI model output was not valid JSON. ${(parseError instanceof Error ? parseError.message : String(parseError))}`
        });
      }

      const validationResult = ExplainCodeOutputSchema.safeParse(parsedOutput);
      if (!validationResult.success) {
        console.error("Gemini output failed Zod validation:", validationResult.error.issues, "Parsed Output:", parsedOutput);
        // Attempt to return the partially valid data if explanation_markdown is present, otherwise throw
        // Client-side toast for partial analysis is better.
        // This is a server-side warning.
        if (parsedOutput.explanation_markdown) {
            console.warn("Partial Analysis: AI model output had some inconsistencies but core explanation is available. Some sections might be missing or incomplete.");
            // Fill missing array fields with empty arrays to prevent crashes
            const defaultFilledOutput = {
                language: parsedOutput.language || "Unknown",
                explanation_markdown: parsedOutput.explanation_markdown,
                style_suggestions: parsedOutput.style_suggestions || [],
                code_smells: parsedOutput.code_smells || [],
                security_vulnerabilities: parsedOutput.security_vulnerabilities || [],
                bug_suggestions: parsedOutput.bug_suggestions || [],
                alternative_suggestions: parsedOutput.alternative_suggestions || [],
                warnings: parsedOutput.warnings || [],
                syntax_errors: parsedOutput.syntax_errors || [],
                ...parsedOutput // Prioritize existing fields from parsedOutput
            };
             return ExplainCodeOutputSchema.parse(defaultFilledOutput); // Re-parse with defaults
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

      if (error instanceof TypeError && error.message.includes('is not a function')) { // Catches errors like ai.generate not being a function
         throw new GenkitError({
            status: 'INTERNAL',
            message: `AI Agent Error (Gemini): A Genkit function was called incorrectly or is unavailable. Original error: ${error.message}`,
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

// Note: The client-side `useToast` cannot be directly called here.
// If server-side "toast" like notifications are needed, they should be logged or handled
// in a way that the client can pick them up (e.g., via error messages or status updates).
// The previous placeholder `toast` function is removed to avoid confusion.
// Proper error handling should propagate errors to the client where `useToast` can be used.
