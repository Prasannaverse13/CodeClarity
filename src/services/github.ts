/**
 * @fileOverview Service to interact with the GitHub Copilot model via Azure AI Inference SDK using a GitHub PAT.
 */

import ModelClient, { isUnexpected, type ChatRequestMessage } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * Represents a code explanation, including the explanation, potential warnings, and detected language.
 */
export interface CodeExplanation {
  /**
   * The detected programming language of the code snippet.
   */
  language?: string;
  /**
   * The explanation of the code, formatted in markdown.
   */
  explanation_markdown: string;
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
 * Asynchronously retrieves a code explanation from the GitHub model API, formatted for the AI Agent.
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
      content: `You are an expert software developer acting as a code reviewer and explainer AI agent.
Your task is to analyze the provided code snippet and return a comprehensive analysis.

1.  **Detect Language**: Identify the programming language.
2.  **Explain Code**: Provide a clear, step-by-step explanation using markdown. Follow this structure:
    ### 🔍 What this code does:
    - Describe the primary function or purpose.
    - Detail inputs and outputs.
    - Explain key internal steps/logic. Use bullet points for clarity.
    - Mention conditions (if/else).

    ### 💡 Summary:
    - Provide a concise summary of the code's main purpose.
3.  **Identify Warnings/Suggestions**: List potential issues, risks (like security vulnerabilities, infinite loops, missing validation), or areas for improvement (like renaming variables, refactoring opportunities).

**Output Format**: Structure your response STRICTLY as a JSON object:
\`\`\`json
{
  "language": "Detected language (e.g., Python, JavaScript)",
  "explanation_markdown": "### 🔍 What this code does:\\n- Point 1\\n- Point 2\\n\\n### 💡 Summary:\\nSummary text.\\n",
  "warnings": ["Optional warning/suggestion 1", "Optional warning/suggestion 2"]
}
\`\`\`
- 'language' field is mandatory.
- 'explanation_markdown' field is mandatory and must contain the structured markdown explanation.
- 'warnings' field is optional. If present, it MUST be an array of strings. If none, provide an empty array [] or omit the field.
- Ensure the markdown uses newline characters (\\n) appropriately within the JSON string.
- Do NOT include any text outside this JSON structure.`,
    },
    { role: "user", content: `Explain the following code snippet:\n\n\`\`\`\n${codeSnippet}\n\`\`\`` },
  ];

  try {
    console.log("Sending request to GitHub Model API...");
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: "openai/gpt-4o", // Specify the desired model
        temperature: 0.3,        // Lower temperature for more focused, structured output
        max_tokens: 1500,       // Adjust as needed
        top_p: 1,
        // response_format: { type: "json_object" } // Keep commented out unless confirmed reliable
      },
      contentType: "application/json",
    });
    console.log("Received response from GitHub Model API.");


    if (isUnexpected(response)) {
      const errorBody = response.body?.error;
      console.error("GitHub Model API Error:", errorBody || `Status ${response.status}`);
      throw new Error(`GitHub Model API request failed with status ${response.status}: ${errorBody?.message || 'Unknown API error'}. Check your GITHUB_TOKEN and API endpoint.`);
    }

    const content = response.body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Received an empty or invalid response content from the GitHub Model API.");
    }

    console.log("Raw API Response Content:", content); // Log raw content for debugging

    try {
      // Clean potential markdown code block fences if the model wraps the JSON
      const cleanedContent = content.replace(/^```json\s*|```$/g, '').trim();
      const parsedResponse = JSON.parse(cleanedContent) as Partial<CodeExplanation>; // Use Partial for initial parsing

      // --- Validation ---
      if (typeof parsedResponse.language !== 'string' || !parsedResponse.language.trim()) {
          console.warn("Parsed response is missing a valid 'language' field or it's empty. Setting to 'Unknown'.");
          parsedResponse.language = 'Unknown';
      }
       if (typeof parsedResponse.explanation_markdown !== 'string' || !parsedResponse.explanation_markdown.trim()) {
        // If critical explanation is missing, throw error or provide fallback
         throw new Error("Parsed response is missing a valid 'explanation_markdown' field.");
      }
      // Normalize warnings: ensure it's an array if present, otherwise default to empty array
        if (parsedResponse.warnings && !Array.isArray(parsedResponse.warnings)) {
            console.warn("Received non-array 'warnings' field, attempting normalization.");
            if (typeof parsedResponse.warnings === 'string' && parsedResponse.warnings.trim()) {
                parsedResponse.warnings = [parsedResponse.warnings];
            } else {
                // If it's something else invalid (like an object), default to empty
                parsedResponse.warnings = [];
            }
        } else if (!parsedResponse.warnings) {
            parsedResponse.warnings = []; // Ensure warnings is always an array
        }

      console.log("Successfully parsed JSON response:", parsedResponse);

      // Return the validated and potentially normalized structure
      return {
        language: parsedResponse.language,
        explanation_markdown: parsedResponse.explanation_markdown,
        warnings: parsedResponse.warnings,
      };

    } catch (parseError) {
      console.error("Failed to parse GitHub Model API response as JSON.", parseError, "Raw Content:", content);
      // Fallback: return the raw content as the explanation and add a specific warning.
      return {
        language: "Unknown",
        explanation_markdown: `### ⚠️ Error Parsing Response\nThe AI's response was not in the expected JSON format. Displaying raw output:\n\n---\n\n${content}`,
        warnings: ["The AI response could not be parsed correctly. The structure might be broken."],
      };
    }

  } catch (error) {
    console.error("Error fetching or processing code explanation from GitHub Model API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get code explanation: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred while fetching the code explanation.");
    }
  }
}
