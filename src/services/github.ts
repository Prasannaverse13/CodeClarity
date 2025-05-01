/**
 * @fileOverview Service to interact with the GitHub Copilot model via Azure AI Inference SDK using a GitHub PAT.
 */

import ModelClient, { isUnexpected, type ChatRequestMessage } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

/**
 * Represents a comprehensive code analysis, including explanation, potential issues, and suggestions.
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
 * Asynchronously retrieves a comprehensive code analysis from the GitHub model API.
 * Simulates multi-agent behavior by instructing the model to perform analysis in distinct steps/roles.
 *
 * @param codeSnippet The code snippet to analyze.
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
    { role: "user", content: `Analyze the following code snippet:\n\n\`\`\`\n${codeSnippet}\n\`\`\`` },
  ];

  try {
    console.log("Sending request to GitHub Model API with multi-persona prompt...");
    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: "openai/gpt-4o", // Specify the desired model
        temperature: 0.4,        // Keep temperature moderate
        max_tokens: 2500,       // Increased token limit slightly more for detailed persona outputs
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
      // Attempt to parse the cleaned content as JSON
      const parsedResponse = JSON.parse(cleanedContent) as Partial<CodeExplanation>;

      // --- Validation and Normalization ---
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

       // Further validation: If explanation is missing/empty after parse, throw error
      if (!validatedResponse.explanation_markdown || validatedResponse.explanation_markdown === "### Error\nCould not extract explanation.") {
           throw new Error("Parsed response is missing a valid 'explanation_markdown' field.");
      }

      console.log("Successfully parsed and validated JSON response:", validatedResponse);
      return validatedResponse;

    } catch (parseError) {
      console.error("Failed to parse GitHub Model API response as JSON.", parseError, "Raw Content:", content);
      // Fallback: return the raw content as the explanation and add a specific warning.
      return {
        language: "Unknown",
        explanation_markdown: `### ⚠️ Error Parsing Response\nThe AI's response was not in the expected JSON format. Displaying raw output:\n\n---\n\n${content}`,
        warnings: ["The AI response could not be parsed correctly. The structure might be broken."],
        // Initialize other fields as empty arrays/undefined for consistency
        style_suggestions: [],
        code_smells: [],
        security_vulnerabilities: [],
        bug_suggestions: [],
        alternative_suggestions: [],
      };
    }

  } catch (error) {
    console.error("Error fetching or processing code explanation from GitHub Model API:", error);
    if (error instanceof Error) {
        // Prepend agent context to the error message
        throw new Error(`AI Agent Error during analysis: ${error.message}`);
    } else {
        throw new Error("An unknown error occurred while the AI Agent was fetching the code explanation.");
    }
  }
}