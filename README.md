# CodeClarity 🧠 - Your AI Code Review & Explanation Agent

CodeClarity is a Next.js web application designed to help users understand and improve code snippets using AI-powered analysis. It leverages the GitHub Copilot model via the Azure AI Inference SDK to provide detailed explanations, identify potential issues, and suggest improvements.

## ✨ Features

-   **Code Input:** Simple interface to paste or type code snippets.
-   **AI-Powered Explanation:** Get detailed, step-by-step explanations of what the code does.
-   **Language Detection:** Automatically identifies the programming language.
-   **Comprehensive Analysis:**
    -   Style & Formatting Suggestions
    -   Code Smell Detection
    -   Security Vulnerability Checks
    -   Potential Bug Identification & Fix Suggestions
    -   Alternative Code Approaches
    -   General Warnings & Suggestions
-   **Learn More:** Provides links to external resources (Google search) based on the detected language and common programming concepts to deepen understanding.
-   **Copy Functionality:** Easily copy the generated explanation or alternative code snippets.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes.
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme (supports light/dark modes based on system preference).

## 🚀 How It Works

1.  **Input:** The user enters a code snippet into the text area on the left panel.
2.  **Request:** Clicking "Explain Code" triggers a request to the Next.js backend (Server Action implicitly via Genkit flow).
3.  **Genkit Flow:** The `explainCode` function in `src/ai/flows/explain-code.ts` orchestrates the process.
4.  **GitHub Model Interaction:**
    -   The flow calls the `getCodeExplanation` function in `src/services/github.ts`.
    -   This service uses the **JavaScript Azure SDK** (`@azure-rest/ai-inference`, `@azure/core-auth`) to securely connect to the GitHub Models inference endpoint (`https://models.github.ai/inference`).
    -   Authentication is handled using a GitHub Personal Access Token (PAT) stored in the `GITHUB_TOKEN` environment variable.
    -   A detailed prompt instructs the `openai/gpt-4o` model (hosted by GitHub) to act as a multi-persona agent, performing analysis steps (explanation, style, security, bugs, alternatives).
    -   The prompt requests the output in a specific JSON format.
5.  **Response Processing:** The service receives the JSON response, parses it, validates the structure, and handles potential errors (like invalid JSON).
6.  **Output:** The structured analysis data is passed back through the Genkit flow to the frontend.
7.  **Display:** The `CodeExplanationDisplay` component (`src/components/code-explanation-display.tsx`) renders the analysis in a user-friendly format, using cards, accordions, and markdown rendering.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router, React Server Components)
-   **AI Orchestration:** Genkit (for defining the `explainCodeFlow`)
-   **AI Model Interaction:** GitHub Copilot Model (`openai/gpt-4o` via `https://models.github.ai/inference`)
-   **Azure SDK:** `@azure-rest/ai-inference`, `@azure/core-auth` (for interacting with the GitHub model endpoint)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React
-   **Deployment:** (Assumed Firebase Hosting or similar Next.js compatible platform)

## 🔑 Key File Locations

-   **AI Flow Definition:** `src/ai/flows/explain-code.ts` (Uses Genkit `ai.defineFlow`)
-   **GitHub Model Service:** `src/services/github.ts` (Contains `getCodeExplanation` function using Azure SDK and GitHub PAT)
-   **Main Page UI:** `src/app/page.tsx` (Main layout and state management)
-   **Code Input Component:** `src/components/code-input.tsx`
-   **Explanation Display Component:** `src/components/code-explanation-display.tsx`
-   **Global Styles & Theme:** `src/app/globals.css`

**Note:** This project uses the **JavaScript Azure SDK** to interact directly with the GitHub model endpoint. It does **not** use the **Autogen** framework. The AI interaction is managed through a structured prompt within a Genkit flow.

## Hackathon Judging Criteria Analysis

**1. Is the project premise interesting?**
Yes, CodeClarity addresses a common need for developers and learners: understanding complex or unfamiliar code quickly and identifying potential improvements using AI.

**2. Is the project creative in how the technology was implemented?**
Moderately creative. It combines a modern web stack (Next.js, ShadCN) with a powerful AI model (GitHub/GPT-4o) accessed via the Azure SDK. The multi-persona prompting strategy to elicit detailed, structured analysis from the model is a key creative element.

**3. Would we use the project ourselves? Could we envision an organization, school, or company using it?**
Yes, developers could use it for quick code reviews, understanding legacy code, or learning new patterns. Educational institutions could use it as a learning tool. Companies could integrate it into developer workflows (with appropriate security considerations).

**4. Is the value/purpose of the project evident?**
Yes, the value lies in accelerating code comprehension, improving code quality through AI suggestions, and providing learning opportunities related to the analyzed code.

**5. Does the project address a real-world scenario? How practical is the solution?**
Yes, it addresses the real-world scenarios of code review, debugging, and learning. The solution is practical for individual code snippets but would need adaptation for analyzing larger codebases or integrating directly into IDEs for broader practicality.

**6. Does the project include sophisticated features such as Human-in-the-Loop?**
The "Learn More" feature provides a simple interaction loop, but it doesn't currently implement sophisticated Human-in-the-Loop (HITL) mechanisms for refining the AI's output or training. The core interaction is one-shot (input code -> get analysis).

**7. Does the project incorporate Responsible AI practices?**
Basic considerations are present (e.g., providing suggestions, not auto-fixing), but more explicit Responsible AI practices could be added:
    -   Clearly stating the AI's limitations.
    -   Warning about potential inaccuracies in suggestions.
    -   Mechanisms for feedback on the explanation quality.
    -   Transparency about the model used.

**8. How complete is the project repository, README, and codebase?**
-   **README:** This README aims to be comprehensive.
-   **Codebase:** The code is functional and uses modern practices (TypeScript, React hooks, Server Components). Some comments have been added to key files (`src/services/github.ts`, `src/ai/flows/explain-code.ts`). A dedicated test suite is currently missing. Security best practices primarily rely on secure PAT handling (via environment variables).
-   **Instructions:** Basic setup requires installing dependencies (`npm install` or `yarn`) and setting the `GITHUB_TOKEN` environment variable. Running requires `npm run dev` or `yarn dev`.

**9. Is there substantial technical implementation? Is the code robust and sophisticated?**
Yes, the implementation involves integrating a frontend (Next.js/React) with a backend flow (Genkit) that calls an external AI service (GitHub Model via Azure SDK). It handles asynchronous operations, state management, and UI updates. The code demonstrates moderate sophistication, utilizing libraries like ShadCN, Genkit, and the Azure SDK. Robustness could be improved with more extensive error handling and testing.

**10. How well does the project showcase the programming language or Microsoft technology of its category?**
-   **Language:** Effectively showcases **TypeScript** within a modern **JavaScript** ecosystem (Next.js/React).
-   **Microsoft Technology:** It directly utilizes the **JavaScript Azure SDK** (`@azure-rest/ai-inference`, `@azure/core-auth`) to interact with the **GitHub Models** endpoint, demonstrating a practical application of these Microsoft-related technologies.

**11. How well does the project implement AI technologies? Is it just a small feature or core to the functionality of the agent?**
AI is **core** to the project's functionality. The entire purpose revolves around the analysis provided by the GitHub AI model. The implementation goes beyond a simple API call by using a structured, multi-persona prompt to elicit detailed and varied analysis categories.

**12. Is the solution an agent built with either the corresponding programming language and Autogen?**
-   The solution is built primarily with **TypeScript/JavaScript**.
-   It functions somewhat like an AI agent by taking input, performing analysis steps (via the multi-persona prompt executed by the underlying LLM), and providing structured output.
-   However, it does **not** use the **Autogen** framework. The "agent-like" behavior is achieved through careful prompting and interaction with the GitHub model via the Azure SDK, orchestrated by Genkit.

## ⚙️ Setup & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your GitHub Personal Access Token (PAT). **Ensure your PAT has the necessary scopes if required by the GitHub model endpoint (refer to GitHub documentation).**
    ```.env
    GITHUB_TOKEN=ghp_YourGitHubPersonalAccessTokenHere
    ```
    *Note: Never commit your `.env` file or your PAT directly into your code.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
5.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

**(Optional) Genkit UI (for debugging flows):**
If you want to inspect the Genkit flows:
```bash
npm run genkit:dev
# or (with file watching)
npm run genkit:watch
```
Then navigate to `http://localhost:4000` (or the port specified by Genkit).
