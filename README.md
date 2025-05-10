# CodeClarity 🧠 - Your AI Code Review & Explanation Agent

CodeClarity is a Next.js web application designed to help users understand and improve code snippets using AI-powered analysis. It leverages the GitHub Copilot model via the Azure AI Inference SDK and the Sensay Wisdom Engine API to provide detailed explanations, identify potential issues, suggest improvements, and offer deeper insights.

## ✨ Features

-   **Code Input:** Simple interface to paste or type code snippets.
-   **AI-Powered Explanation (GitHub Model):** Get detailed, step-by-step explanations of what the code does.
-   **Language Detection:** Automatically identifies the programming language.
-   **Comprehensive Analysis (GitHub Model):**
    -   Style & Formatting Suggestions
    -   Code Smell Detection
    -   Security Vulnerability Checks
    -   Potential Bug Identification & Fix Suggestions
    -   Alternative Code Approaches
    -   General Warnings & Suggestions
-   **Sensay Wisdom Engine Integration:**
    -   Get additional, potentially deeper, insights on your code from Sensay's AI.
    -   Leverage Sensay's capabilities for a different perspective on code analysis.
-   **Learn More:** Provides links to external resources (Google search) based on the detected language and common programming concepts to deepen understanding.
-   **Copy Functionality:** Easily copy the generated explanation or alternative code snippets.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes.
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme (supports light/dark modes based on system preference).
-   **Dark/Light Mode Toggle:** User can switch between dark and light themes.
-   **Code Input with Line Numbers:** Enhanced textarea for better code readability and error referencing.

## 🚀 How It Works

1.  **Input:** The user enters a code snippet into the enhanced text area (with line numbers) on the left panel.
2.  **Request ("Explain Code"):** Clicking "Explain Code" triggers a request to the Next.js backend (Server Action implicitly via Genkit flow).
3.  **Genkit Flow (`explainCodeFlow`):** The `explainCode` function in `src/ai/flows/explain-code.ts` orchestrates the process for GitHub model analysis.
4.  **GitHub Model Interaction:**
    -   The flow calls the `getCodeExplanation` function in `src/services/github.ts`.
    -   This service uses the **JavaScript Azure SDK** (`@azure-rest/ai-inference`, `@azure/core-auth`) to securely connect to the GitHub Models inference endpoint (`https://models.github.ai/inference`).
    -   Authentication is handled using a GitHub Personal Access Token (PAT) stored in the `GITHUB_TOKEN` environment variable.
    -   A detailed prompt instructs the `openai/gpt-4o` model (hosted by GitHub) to act as a multi-persona agent, performing analysis steps.
    -   The prompt requests the output in a specific JSON format.
5.  **GitHub Response Processing:** The service receives the JSON response, parses it, validates the structure, and handles potential errors.
6.  **Display GitHub Analysis:** The structured analysis data is passed back through the Genkit flow to the frontend and displayed.
7.  **Request ("Get Sensay Wisdom"):** After the GitHub analysis, the user can click "Get Sensay Wisdom".
8.  **Genkit Flow (`sensayCodeInsightFlow`):** The `getSensayCodeInsight` function in `src/ai/flows/sensay-code-insight-flow.ts` is triggered.
9.  **Sensay API Interaction:**
    -   The flow calls the `getSensayInteraction` function in `src/services/sensay.ts`.
    -   This service makes a POST request to the Sensay API endpoint (`https://api.sensay.io/v1/interactions`).
    -   Authentication is handled using a Sensay API Key stored in the `SENSAY_API_KEY` environment variable.
    -   The code snippet is sent as input to Sensay.
10. **Sensay Response Processing:** The service receives the response from Sensay and extracts the relevant insight.
11. **Display Sensay Insight:** The insight from Sensay is displayed in a new section on the UI.
12. **UI Rendering:** The `CodeExplanationDisplay` component (`src/components/code-explanation-display.tsx`) renders all analyses in a user-friendly format.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router, React Server Components)
-   **AI Orchestration:** Genkit (for defining `explainCodeFlow` and `sensayCodeInsightFlow`)
-   **AI Models & Services:**
    -   GitHub Copilot Model (`openai/gpt-4o` via `https://models.github.ai/inference`)
    -   Sensay Wisdom Engine API (`https://api.sensay.io`)
-   **Azure SDK:** `@azure-rest/ai-inference`, `@azure/core-auth` (for interacting with the GitHub model endpoint)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React
-   **Deployment:** (Assumed Firebase Hosting or similar Next.js compatible platform)

## 🔑 Key File Locations

-   **GitHub AI Flow Definition:** `src/ai/flows/explain-code.ts`
-   **GitHub Model Service:** `src/services/github.ts`
-   **Sensay AI Flow Definition:** `src/ai/flows/sensay-code-insight-flow.ts`
-   **Sensay API Service:** `src/services/sensay.ts`
-   **Main Page UI:** `src/app/page.tsx`
-   **Code Input Component:** `src/components/code-input.tsx`
-   **Explanation Display Component:** `src/components/code-explanation-display.tsx`
-   **Global Styles & Theme:** `src/app/globals.css`
-   **Theme Provider & Toggle:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

**Note:** This project uses the **JavaScript Azure SDK** to interact directly with the GitHub model endpoint. It also directly interacts with the **Sensay Wisdom Engine API**. It does **not** use the **Autogen** framework. AI interactions are managed through structured prompts within Genkit flows.

## Hackathon Judging Criteria Analysis

**1. Is the project premise interesting?**
Yes, CodeClarity addresses a common need for developers and learners: understanding complex or unfamiliar code quickly and identifying potential improvements using multiple AI perspectives (GitHub and Sensay).

**2. Is the project creative in how the technology was implemented?**
Moderately creative. It combines a modern web stack (Next.js, ShadCN) with two distinct AI models/services: GitHub/GPT-4o (via Azure SDK) and the Sensay Wisdom Engine API. The multi-persona prompting strategy for GitHub and the integration of a secondary AI for potentially deeper insights (Sensay) adds a layer of creativity.

**3. Would we use the project ourselves? Could we envision an organization, school, or company using it?**
Yes, developers could use it for quick code reviews, understanding legacy code, or learning new patterns. The dual AI approach could offer more comprehensive feedback. Educational institutions could use it as an advanced learning tool. Companies could explore it for developer workflows.

**4. Is the value/purpose of the project evident?**
Yes, the value lies in accelerating code comprehension, improving code quality through AI suggestions from multiple sources, and providing diverse learning opportunities related to the analyzed code.

**5. Does the project address a real-world scenario? How practical is the solution?**
Yes, it addresses real-world scenarios of code review, debugging, and learning. The solution is practical for individual code snippets. The addition of Sensay aims to enhance the depth or breadth of analysis.

**6. Does the project include sophisticated features such as Human-in-the-Loop?**
The "Learn More" feature provides a simple interaction loop. The core interaction is primarily one-shot for each AI (input code -> get analysis). True HITL for refining AI output is not deeply implemented.

**7. Does the project incorporate Responsible AI practices?**
Basic considerations are present (providing suggestions, not auto-fixing). With multiple AI sources, it becomes more important to:
    -   Clearly attribute which AI provided which piece of information.
    -   State limitations of each AI.
    -   Warn about potential inaccuracies.
    -   Mechanisms for feedback could be beneficial.

**8. How complete is the project repository, README, and codebase?**
-   **README:** This README aims to be comprehensive, covering the dual AI integration.
-   **Codebase:** The code is functional and uses modern practices (TypeScript, React hooks, Server Components). Comments are present in key service and flow files. Dedicated test suites are missing. Security relies on secure PAT/API key handling via environment variables.
-   **Instructions:** Setup requires installing dependencies and setting `GITHUB_TOKEN` and `SENSAY_API_KEY` environment variables.

**9. Is there substantial technical implementation? Is the code robust and sophisticated?**
Yes, the implementation involves integrating a frontend with backend flows (Genkit) that call two distinct external AI services using different authentication and interaction patterns. It handles asynchronous operations, state management, and UI updates for multiple AI outputs. The code demonstrates moderate sophistication. Robustness depends on the reliability of the external APIs and could be improved with more granular error handling for each service.

**10. How well does the project showcase the programming language or Microsoft technology of its category?**
-   **Language:** Effectively showcases **TypeScript** within a modern **JavaScript** ecosystem (Next.js/React).
-   **Microsoft Technology:** It directly utilizes the **JavaScript Azure SDK** (`@azure-rest/ai-inference`, `@azure/core-auth`) to interact with the **GitHub Models** endpoint.

**11. How well does the project implement AI technologies? Is it just a small feature or core to the functionality of the agent?**
AI is **core** to the project. The GitHub model provides the primary detailed breakdown. The Sensay Wisdom Engine is integrated as a complementary AI to offer additional or different types of insights, making AI central to the agent's enhanced functionality.

**12. Is the solution an agent built with either the corresponding programming language and Autogen?**
-   The solution is built primarily with **TypeScript/JavaScript**.
-   It functions like an AI agent by taking input, orchestrating analysis through multiple AI services (GitHub and Sensay), and providing structured, combined output.
-   It does **not** use the **Autogen** framework. Agent-like behavior is achieved through Genkit flows, careful prompting, and direct API interactions.

## ⚙️ Setup & Running

1.  **Clone the repository:**
    ```bash
    git clone &lt;repository-url&gt;
    cd &lt;repository-directory&gt;
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project (you can copy `.env.example` to `.env`).
    
    **a. GitHub Personal Access Token (PAT):**
    Ensure your PAT has the necessary scopes if required by the GitHub model endpoint.
    ```.env
    GITHUB_TOKEN=ghp_YourGitHubPersonalAccessTokenHere
    ```

    **b. Sensay API Key:**
    First, you need to redeem your Sensay invite code to get an API key.
    Your invite code is: `R7YDLC4`
    You can redeem it using a tool like `curl` or Postman by making a POST request:
    ```bash
    curl -X POST "https://api.sensay.io/v1/api_keys/invites/R7YDLC4/redeem" -H "Content-Type: application/json" -d "{}"
    ```
    The response will look something like this:
    ```json
    {
      "id": "key_xxxxxxxxxxxx",
      "api_key": "sensay_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // This is your API Key
      "name": "Default Key from Invite R7YDLC4",
      "created_at": "2024-05-15T12:00:00Z",
      "last_used_at": null,
      "is_active": true
    }
    ```
    Copy the `api_key` value (e.g., `sensay_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) from the response and add it to your `.env` file:
    ```.env
    SENSAY_API_KEY=sensay_sk_YourSensayApiKeyHere
    ```
    *Note: Never commit your `.env` file or your API keys directly into your code.*

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