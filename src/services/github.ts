/**
 * @fileOverview Service to interact with the GitHub Copilot model via Azure AI Inference SDK using a GitHub PAT.
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

// Load the GitHub Personal Access Token from environment variables.
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  // Log a warning if the token is missing. In a production app, consider throwing an error
  // or having a more robust configuration management approach.
  console.warn("GITHUB_TOKEN environment variable is not set. GitHub API calls will likely fail.");
}

// Initialize the ModelClient with the GitHub Inference endpoint and the PAT.
// If the token is missing, use a placeholder to avoid immediate errors during initialization,
// but subsequent API calls will fail authentication.
const client = ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(githubToken || "dummy-token-placeholder")
);

/**
 * Asynchronously retrieves a code explanation from the GitHub model API.
 *
 * @param codeSnippet The code snippet to explain.
 * @returns A promise that resolves to a CodeExplanation object.
 * @throws Throws an error if the GITHUB_TOKEN is not configured, the API call fails,
 *         returns an unexpected response, or the response content is empty/invalid.
 */
export async function getCodeExplanation(codeSnippet: string): Promise<CodeExplanation> {
  // Check if the token is configured before making the call.
  if (!githubToken) {
    throw new Error("GitHub Personal Access Token (GITHUB_TOKEN) is not configured. Cannot call the GitHub model API.");
  }

  const messages: ChatRequestMessage[] = [
    {
      role: "system",
      content: `You are an expert software developer acting as a code explainer.
Your task is to analyze the provided code snippet and return a clear, concise explanation suitable for other developers.
Focus on the code's purpose, logic, and key operations.
If you identify potential issues, areas for improvement, or important caveats, include them as warnings.

**IMPORTANT**: Structure your response strictly as a JSON object with the following format:
{
  "explanation": "A detailed explanation of the code goes here.",
  "warnings": ["Optional warning 1", "Optional warning 2"]
}
- The 'explanation' field is mandatory and should contain the main explanation text.
- The 'warnings' field is optional. If present, it MUST be an array of strings. If there are no warnings, you can either omit the 'warnings' field or provide an empty array [].
Do not include any text outside of this JSON structure.`,
    },
    { role: "user", content: `Explain the following code snippet:\n\n\`\`\`\n${codeSnippet}\n\`\`\`` },
  ];

  try {
    // Make the API call to the GitHub model endpoint.
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: "openai/gpt-4o", // Specify the desired model
        temperature: 0.5,        // Adjust temperature for desired creativity vs determinism
        max_tokens: 1024,       // Limit response length
        top_p: 1,
        // response_format: { type: "json_object" } // Request JSON output if supported reliably by the specific endpoint/model
      },
      contentType: "application/json", // Ensure correct content type
    });

    // Check for unexpected HTTP status codes.
    if (isUnexpected(response)) {
      const errorBody = response.body?.error;
      console.error("GitHub Model API Error:", errorBody || `Status ${response.status}`);
      // Provide a more informative error message.
      throw new Error(`GitHub Model API request failed with status ${response.status}: ${errorBody?.message || 'Unknown API error'}. Check your GITHUB_TOKEN and API endpoint.`);
    }

    // Extract the content from the response.
    const content = response.body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Received an empty or invalid response content from the GitHub Model API.");
    }

    // Attempt to parse the response content as JSON, expecting the format defined in the system prompt.
    try {
      const parsedResponse: CodeExplanation = JSON.parse(content);

      // Validate the parsed structure.
      if (typeof parsedResponse.explanation !== 'string' || !parsedResponse.explanation.trim()) {
        throw new Error("Parsed response is missing a valid 'explanation' field.");
      }

      // Ensure 'warnings', if present, is an array. Provide an empty array otherwise.
       if (parsedResponse.warnings && !Array.isArray(parsedResponse.warnings)) {
            console.warn("Received non-array 'warnings' field, normalizing to array.");
            // Attempt basic normalization, e.g., wrap single string in an array
            if (typeof parsedResponse.warnings === 'string') {
                parsedResponse.warnings = [parsedResponse.warnings];
            } else {
                parsedResponse.warnings = []; // Fallback for other invalid types
            }
        }


      return {
        explanation: parsedResponse.explanation,
        warnings: parsedResponse.warnings || [], // Default to empty array if warnings is null/undefined
      };
    } catch (parseError) {
      // If JSON parsing fails, it means the model didn't adhere to the requested format.
      console.warn("Failed to parse GitHub Model API response as JSON. The model might not have followed the format instructions. Using raw content as explanation.", parseError, "Raw Content:", content);
      // Fallback: return the raw content as the explanation and indicate no structured warnings.
      return {
        explanation: content,
        warnings: ["Warning: The AI response was not in the expected JSON format. Displaying raw output."],
      };
    }

  } catch (error) {
    // Catch network errors or errors thrown during processing.
    console.error("Error fetching or processing code explanation from GitHub Model API:", error);
    // Re-throw a consistent error type.
    if (error instanceof Error) {
        // Include specific details if available, otherwise provide a general message.
        throw new Error(`Failed to get code explanation: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred while fetching the code explanation.");
    }
  }
}
