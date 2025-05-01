/**
 * @fileOverview Service to interact with the GitHub Copilot model via Azure AI Inference SDK using a GitHub PAT.
 * This service encapsulates the logic for calling the GitHub Models API endpoint.
 */

import ModelClient, { isUnexpected, type ChatRequestMessage } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * Represents a comprehensive code analysis, including explanation, potential issues, and suggestions.
 * This interface defines the structured output expected from the AI model.
 */
export interface CodeExplanation {
  /** The detected programming language of the code snippet. Defaults to "Unknown". */
  language: string;
  /** The detailed explanation of the code, formatted in markdown. */
  explanation_markdown: string;
  /** Potential warnings or general suggestions related to the code. */
  warnings?: string[];
  /** Suggestions for improving code style and formatting. */
  style_suggestions?: string[];
  /** Identified code smells indicating potential design problems. */
  code_smells?: string[];
  /** Detected potential security vulnerabilities. */
  security_vulnerabilities?: string[];
  /** Identified potential bugs and suggested fixes. */
  bug_suggestions?: { bug: string; fix_suggestion: string }[];
  /** Alternative ways to write the same logic. */
  alternative_suggestions?: { description: string; code: string }[];
}


// Load the GitHub Personal Access Token (PAT) from environment variables.
// IMPORTANT: Ensure GITHUB_TOKEN is set in your .env file.
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  // Log a warning if the token is missing. In a production app, consider throwing an error
  // or having a more robust configuration management approach.
  console.warn("WARNING: GITHUB_TOKEN environment variable is not set. GitHub API calls will fail authentication.");
}

// Initialize the Azure SDK ModelClient for the GitHub Inference endpoint.
// This client will be used to make requests to the AI model.
const client = ModelClient(
  "https://models.github.ai/inference", // The specific endpoint for GitHub Models
  // Use AzureKeyCredential for PAT authentication.
  // If the token is missing, use a placeholder to avoid immediate errors during initialization,
  // but subsequent API calls will fail authentication (401 Unauthorized).
  new AzureKeyCredential(githubToken || "dummy-token-placeholder")
);

/**
 * Asynchronously retrieves a comprehensive code analysis from the GitHub model API.
 * This function constructs the prompt, sends the request using the Azure SDK client,
 * parses the response, and performs validation.
 *
 * @param codeSnippet The code snippet to analyze.
 * @returns A promise that resolves to a CodeExplanation object.
 * @throws Throws an error if the GITHUB_TOKEN is not configured, the API call fails,
 *         returns an unexpected response, or the response content is empty/invalid JSON.
 */
export async function getCodeExplanation(codeSnippet: string): Promise<CodeExplanation> {
  // Strict check: Prevent API call if token is definitely missing.
  if (!githubToken) {
    throw new Error("Configuration Error: GitHub Personal Access Token (GITHUB_TOKEN) is not configured. Cannot call the GitHub model API.");
  }

  // Define the chat messages, including the system prompt and user prompt.
  const messages: ChatRequestMessage[] = [
    {
      role: "system",
      // This system prompt instructs the model to act as a multi-persona agent
      // and specifies the desired JSON output structure.
      content: `You are an AI Agent composed of multiple expert personas acting sequentially to analyze code.
Analyze the provided code snippet by performing the following roles in order:

**1. Code Analyst Persona:**
    - **Detect Language**: Identify the programming language.
    - **Explain Code**: Provide a clear, step-by-step explanation using markdown. Structure:
        ### 🔍 What this code does:
        - Primary function/purpose.
        - Inputs and outputs (if applicable).
        - Key internal steps/logic (use bullet points).
        - Conditions (if/else, loops).
        ### 💡 Summary:
        - Concise summary of the code's main purpose.

**2. Style & Readability Persona:**
    - **Style Suggestions**: List suggestions for improving code style and formatting based on common conventions for the detected language.
    - **Code Smells**: Identify code patterns that might indicate potential design problems or reduce maintainability.

**3. Security Reviewer Persona:**
    - **Security Vulnerabilities**: Check for common security flaws (e.g., injection risks, insecure handling of data, lack of validation, hardcoded secrets). List any potential vulnerabilities found.

**4. Bug Detector Persona:**
    - **Bug Suggestions**: Identify potential logical bugs or edge cases that might lead to errors. For each potential bug, describe it and suggest a specific fix.

**5. Alternative Architect Persona:**
    - **Alternative Suggestions**: Suggest 1-2 alternative ways to write the same logic, explaining the trade-offs (e.g., efficiency, readability, different approach). Provide code snippets for alternatives.

**General Task:**
    - **Warnings/General Suggestions**: List any general warnings or broader suggestions not covered by the specific personas above.

**Output Format**: Structure your response STRICTLY as a JSON object:
\`\`\`json
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
    { "description": "Alternative 1 description", "code": "Alternative code snippet 1" },
    { "description": "Alternative 2 description", "code": "Alternative code snippet 2" }
  ]
}
\`\`\`
- All fields except \`language\` and \`explanation_markdown\` are optional. If no items exist for an array field (e.g., warnings), provide an empty array \`[]\`.
- For \`bug_suggestions\`, each item MUST have both \`bug\` and \`fix_suggestion\`.
- For \`alternative_suggestions\`, each item MUST have both \`description\` and \`code\`.
- Ensure valid JSON, including proper escaping of newlines (\\n) and quotes within strings.
- Do NOT include any text outside this JSON structure.`,
    },
    // The user message containing the code snippet to be analyzed.
    { role: "user", content: `Analyze the following code snippet:\n\n\`\`\`\n${codeSnippet}\n\`\`\`` },
  ];

  try {
    // Log the attempt to call the API.
    console.log("Sending request to GitHub Model API (via Azure SDK)...");

    // Make the POST request to the /chat/completions endpoint using the Azure SDK client.
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: "openai/gpt-4o", // Specify the desired model hosted by GitHub
        temperature: 0.4,       // Controls randomness (lower means more deterministic)
        max_tokens: 2500,       // Max length of the generated response
        top_p: 1,               // Nucleus sampling parameter
        // response_format: { type: "json_object" } // This might help enforce JSON, but can be unreliable. Keep commented for now.
      },
      contentType: "application/json", // Specify the content type
    });

    // Log that a response was received.
    console.log("Received response from GitHub Model API.");

    // Check if the response status code indicates an error (e.g., 4xx, 5xx).
    // `isUnexpected` is a helper from the Azure SDK.
    if (isUnexpected(response)) {
      const errorBody = response.body?.error;
      console.error("GitHub Model API Error Response:", errorBody || `Status: ${response.status}`);
      // Throw a detailed error including the status and message from the API if available.
      throw new Error(`GitHub Model API request failed with status ${response.status}: ${errorBody?.message || 'Unknown API error'}. Check your GITHUB_TOKEN and API endpoint.`);
    }

    // Extract the text content from the first choice in the response.
    const content = response.body.choices?.[0]?.message?.content;

    // Check if the content is missing or empty.
    if (!content) {
      throw new Error("Received an empty or invalid response content from the GitHub Model API.");
    }

    // Log the raw content for debugging purposes, especially if JSON parsing fails.
    // console.log("Raw API Response Content:", content);

    try {
      // Attempt to clean potential markdown code block fences (```json ... ```)
      // that the model might add around the JSON output.
      const cleanedContent = content.replace(/^```json\s*|```$/g, '').trim();

      // Parse the cleaned string content as JSON.
      const parsedResponse = JSON.parse(cleanedContent) as Partial<CodeExplanation>;

      // --- Validation and Normalization ---
      // Ensure the parsed object conforms to the CodeExplanation interface,
      // providing default values (empty arrays, "Unknown") for missing or invalid fields.
      const validatedResponse: CodeExplanation = {
        language: typeof parsedResponse.language === 'string' && parsedResponse.language.trim() ? parsedResponse.language : "Unknown",
        explanation_markdown: typeof parsedResponse.explanation_markdown === 'string' && parsedResponse.explanation_markdown.trim() ? parsedResponse.explanation_markdown : "### Error\nCould not extract explanation.",
        warnings: Array.isArray(parsedResponse.warnings) ? parsedResponse.warnings.filter(w => typeof w === 'string') : [],
        style_suggestions: Array.isArray(parsedResponse.style_suggestions) ? parsedResponse.style_suggestions.filter(s => typeof s === 'string') : [],
        code_smells: Array.isArray(parsedResponse.code_smells) ? parsedResponse.code_smells.filter(s => typeof s === 'string') : [],
        security_vulnerabilities: Array.isArray(parsedResponse.security_vulnerabilities) ? parsedResponse.security_vulnerabilities.filter(v => typeof v === 'string') : [],
        bug_suggestions: Array.isArray(parsedResponse.bug_suggestions)
          ? parsedResponse.bug_suggestions.filter(b => b && typeof b.bug === 'string' && typeof b.fix_suggestion === 'string')
          : [],
        alternative_suggestions: Array.isArray(parsedResponse.alternative_suggestions)
          ? parsedResponse.alternative_suggestions.filter(a => a && typeof a.description === 'string' && typeof a.code === 'string')
          : [],
      };

       // Further validation: If explanation is missing/empty even after parsing, it indicates a problem.
      if (!validatedResponse.explanation_markdown || validatedResponse.explanation_markdown === "### Error\nCould not extract explanation.") {
           throw new Error("Parsed response is missing a valid 'explanation_markdown' field.");
      }

      // Log success if parsing and validation are successful.
      console.log("Successfully parsed and validated JSON response.");
      return validatedResponse;

    } catch (parseError) {
      // Handle errors during JSON parsing (e.g., if the model didn't return valid JSON).
      console.error("Failed to parse GitHub Model API response as JSON.", parseError, "Raw Content:", content);
      // Fallback: Return a structured error message within the expected format.
      return {
        language: "Unknown",
        explanation_markdown: `### ⚠️ Error Parsing Response\nThe AI's response was not in the expected JSON format. Displaying raw output:\n\n---\n\n${content}`,
        warnings: ["The AI response could not be parsed correctly. The structure might be broken."],
        // Initialize other fields as empty arrays for consistency.
        style_suggestions: [],
        code_smells: [],
        security_vulnerabilities: [],
        bug_suggestions: [],
        alternative_suggestions: [],
      };
    }

  } catch (error) {
    // Catch any other errors during the API call or processing.
    console.error("Error fetching or processing code explanation from GitHub Model API:", error);
    // Re-throw the error, adding context, to be handled by the calling flow/component.
    if (error instanceof Error) {
        throw new Error(`GitHub Service Error: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred in the GitHub service.");
    }
  }
}
