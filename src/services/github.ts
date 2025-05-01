/**
 * @fileOverview Service to interact with the GitHub Copilot model via Azure AI Inference SDK.
 */

import ModelClient, { isUnexpected, type ChatRequestMessage } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * Represents a code explanation, including the explanation and potential warnings.
 */
export interface CodeExplanation {
  /**
   * The explanation of the code.
   */
  explanation: string;
  /**
   * Any warnings associated with the code. Can be undefined or an empty array.
   */
  warnings?: string[];
}

// Ensure the environment variable is loaded (in a real app, use a more robust method)
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.warn("GITHUB_TOKEN environment variable not set. Code explanation will likely fail.");
}

const client = ModelClient(
  "https://models.github.ai/inference",
  // Use a dummy key if the token is not available to avoid immediate errors,
  // but the API call will fail later.
  new AzureKeyCredential(githubToken || "dummy-token")
);

/**
 * Asynchronously retrieves a code explanation from the GitHub Copilot API using Azure AI Inference.
 *
 * @param codeSnippet The code snippet to explain.
 * @returns A promise that resolves to a CodeExplanation object.
 * @throws Throws an error if the API call fails or returns an unexpected response.
 */
export async function getCodeExplanation(codeSnippet: string): Promise<CodeExplanation> {
   if (!githubToken) {
     throw new Error("GitHub Personal Access Token (GITHUB_TOKEN) is not configured.");
   }

  const messages: ChatRequestMessage[] = [
    {
      role: "system",
      content: `You are an expert software developer. Your task is to explain the provided code snippet in plain, understandable language. Focus on the logic, purpose, and key operations. If you identify potential issues, warnings, or areas for improvement, list them clearly. Structure your response with an 'explanation' field and an optional 'warnings' array. If there are no warnings, provide an empty array or omit the field.

Example response format:
{
  "explanation": "This code does...",
  "warnings": ["Potential issue 1", "Suggestion for improvement"]
}
OR
{
  "explanation": "This code does..."
}`,
    },
    { role: "user", content: `Explain the following code:\n\n\`\`\`\n${codeSnippet}\n\`\`\`` },
  ];

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: "openai/gpt-4o", // Using a recommended model, adjust if needed
        temperature: 0.7, // Slightly creative but mostly factual
        max_tokens: 1024, // Limit response length
        top_p: 1,
        // Request JSON output if the model supports it reliably.
        // This might require specific model versions or parameters.
        // response_format: { type: "json_object" },
      },
       // Set content type if needed, though usually handled by the SDK
       contentType: "application/json",
    });

    if (isUnexpected(response)) {
       // Log the detailed error response for debugging
       console.error("GitHub Copilot API Error:", response.body?.error || response.status);
       throw new Error(`GitHub Copilot API request failed with status ${response.status}: ${response.body?.error?.message || 'Unknown error'}`);
    }

    const content = response.body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Received an empty response from the GitHub Copilot API.");
    }

    // Attempt to parse the response as JSON.
    // This relies on the model following the system prompt's instructions.
    try {
        const parsedResponse: CodeExplanation = JSON.parse(content);
        // Basic validation
        if (typeof parsedResponse.explanation !== 'string') {
            throw new Error("Parsed response lacks a valid 'explanation' field.");
        }
         // Ensure warnings is an array if present
        if (parsedResponse.warnings && !Array.isArray(parsedResponse.warnings)) {
            console.warn("Received non-array 'warnings', attempting to normalize.");
            // Attempt to handle simple cases, e.g., a single string warning
            if (typeof parsedResponse.warnings === 'string') {
                 parsedResponse.warnings = [parsedResponse.warnings];
            } else {
                 parsedResponse.warnings = []; // Fallback to empty array
            }
        }


        return {
            explanation: parsedResponse.explanation,
            // Ensure warnings is an empty array if null/undefined after parsing
            warnings: parsedResponse.warnings || [],
        };
    } catch (parseError) {
        // If JSON parsing fails, treat the entire content as the explanation.
        console.warn("Failed to parse API response as JSON. Using raw content as explanation.", parseError);
        return {
            explanation: content,
            warnings: [], // No structured warnings could be parsed
        };
    }

  } catch (error) {
    console.error("Error calling GitHub Copilot API:", error);
    // Re-throw a more user-friendly error or the original error
    if (error instanceof Error) {
        throw new Error(`Failed to get code explanation: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred while fetching the code explanation.");
    }
  }
}

// Example usage (optional, for testing)
/*
async function testExplanation() {
  try {
    const explanation = await getCodeExplanation("function add(a, b) {\n  return a + b;\n}");
    console.log("Explanation:", explanation.explanation);
    console.log("Warnings:", explanation.warnings);
  } catch (err) {
    console.error("Test encountered an error:", err);
  }
}

// Ensure GITHUB_TOKEN is set in your environment before running this test
// testExplanation();
*/
