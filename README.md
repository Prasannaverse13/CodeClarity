
# CodeClarity 🧠 - Your AI Code Review & Explanation Agent

CodeClarity is a Next.js web application designed to help users understand and improve code snippets using AI-powered analysis. It leverages **Google Gemini** (via Genkit) and optionally the Sensay Wisdom Engine API to provide detailed explanations, identify potential issues, suggest improvements, and offer deeper insights.

## ✨ Features

-   **Code Input:** Simple interface to paste or type code snippets with line numbers.
-   **AI-Powered Explanation (Google Gemini):** Get detailed, step-by-step explanations of what the code does.
-   **Language Detection:** Automatically identifies the programming language.
-   **Comprehensive Analysis (Google Gemini via Prompting):**
    -   Style & Formatting Suggestions
    -   Code Smell Detection
    -   Security Vulnerability Checks
    -   Potential Bug Identification & Fix Suggestions
    -   Alternative Code Approaches
    -   General Warnings & Suggestions
-   **Sensay Wisdom Engine Integration (Optional):**
    -   Get additional, potentially deeper, insights on your code from Sensay's AI.
-   **Learn More:** Provides links to external resources (Google search) based on the detected language and common programming concepts to deepen understanding.
-   **Copy Functionality:** Easily copy the generated explanation or alternative code snippets.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes.
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme (supports light/dark modes based on system preference).
-   **Dark/Light Mode Toggle:** User can switch between dark and light themes.

## 🚀 How It Works

1.  **Input:** The user enters a code snippet into the enhanced text area (with line numbers) on the left panel.
2.  **Request ("Explain Code"):** Clicking "Explain Code" triggers a request to the Next.js backend (Server Action implicitly via Genkit flow).
3.  **Genkit Flow (`explainCodeFlow` in `explain-code.ts`):** The `explainCode` function in `src/ai/flows/explain-code.ts` orchestrates the process for Google Gemini model analysis.
    -   This flow uses `ai.generate()` from Genkit to interact with the configured Google Gemini model (e.g., `gemini-1.5-flash-latest`).
    -   A detailed system prompt instructs Gemini to analyze the code and return a structured JSON output containing explanations, language detection, warnings, suggestions, etc.
4.  **Gemini Response Processing:** The Genkit flow receives the JSON response from Gemini, parses it (Genkit can do this automatically if schema is provided), validates the structure, and handles potential errors.
5.  **Display Gemini Analysis:** The structured analysis data is passed back to the frontend and displayed.
6.  **Request ("Get Sensay Wisdom") (Optional):** After the Gemini analysis, the user can click "Get Sensay Wisdom".
7.  **Genkit Flow (`sensayCodeInsightFlow`):** The `getSensayCodeInsight` function in `src/ai/flows/sensay-code-insight-flow.ts` is triggered.
8.  **Sensay API Interaction:**
    -   The flow calls the `getSensayInteraction` function in `src/services/sensay.ts`.
    -   This service makes a POST request to the Sensay API endpoint.
    -   Authentication is handled using a Sensay API Key stored in the `SENSAY_API_KEY` environment variable.
9.  **Sensay Response Processing:** The service receives the response from Sensay and extracts the relevant insight.
10. **Display Sensay Insight:** The insight from Sensay is displayed in a new section on the UI.
11. **UI Rendering:** The `CodeExplanationDisplay` component (`src/components/code-explanation-display.tsx`) renders all analyses.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router, React Server Components)
-   **AI Orchestration & Interaction:** Genkit
-   **AI Models & Services:**
    -   **Google Gemini** (e.g., `gemini-1.5-flash-latest` via Genkit `googleAI` plugin)
    -   Sensay Wisdom Engine API (Optional)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React

## 🔑 Key File Locations

-   **Google Gemini AI Flow Definition:** `src/ai/flows/explain-code.ts` (Uses Genkit `ai.generate()`)
-   **Genkit Configuration:** `src/ai/ai-instance.ts` (Configures `googleAI` plugin)
-   **Sensay AI Flow Definition:** `src/ai/flows/sensay-code-insight-flow.ts`
-   **Sensay API Service:** `src/services/sensay.ts`
-   **Main Page UI:** `src/app/page.tsx`
-   **Code Input Component:** `src/components/code-input.tsx`
-   **Explanation Display Component:** `src/components/code-explanation-display.tsx`
-   **Global Styles & Theme:** `src/app/globals.css`
-   **Theme Provider & Toggle:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

**Note:** This project primarily uses **Genkit** with the **`googleAI` plugin** to interact with Google Gemini models. It also directly interacts with the **Sensay Wisdom Engine API** if configured.

## Hackathon Judging Criteria Analysis

**1. Is the project premise interesting?**
Yes, CodeClarity addresses a common need for developers: understanding code and getting AI-driven feedback. Using Gemini provides a powerful LLM for this.

**2. Is the project creative in how the technology was implemented?**
Moderately. It combines Next.js with Genkit for AI orchestration, targeting Google Gemini. The creativity lies in the comprehensive prompting strategy for Gemini to elicit structured analysis and the optional integration of a secondary AI (Sensay).

**3. Would we use the project ourselves? Could we envision an organization, school, or company using it?**
Yes, developers could use it for code comprehension and quick feedback. Educational institutions could use it as a learning tool.

**4. Is the value/purpose of the project evident?**
Yes, to accelerate code understanding and improve code quality through AI suggestions from Gemini.

**5. Does the project address a real-world scenario? How practical is the solution?**
Yes, it addresses real-world scenarios of code review, debugging, and learning for individual code snippets.

**6. Does the project include sophisticated features such as Human-in-the-Loop?**
The "Learn More" feature and "Explain Another" offer simple interaction loops. Deeper HITL is not implemented. The prompt to Gemini for structured output is a form of guiding the AI.

**7. Does the project incorporate Responsible AI practices?**
It provides suggestions, not auto-fixes. Clear attribution (Gemini, Sensay) is important. Stating limitations and potential inaccuracies is good practice.

**8. How complete is the project repository, README, and codebase?**
-   **README:** This README aims to be comprehensive for the Gemini-based version.
-   **Codebase:** Functional, uses TypeScript, React hooks, Server Components. Comments in key files. Test suites are missing. Security relies on secure API key handling.
-   **Instructions:** Setup requires `npm install` and setting `GOOGLE_GENAI_API_KEY` (and optionally `SENSAY_API_KEY`).

**9. Is there substantial technical implementation? Is the code robust and sophisticated?**
Yes, integration of frontend with Genkit flows calling Google Gemini. Handles async operations, state management, and UI updates. The prompting for structured JSON from Gemini shows an attempt at sophisticated AI interaction.

**10. How well does the project showcase the programming language or Microsoft technology of its category?**
-   **Language:** Effectively showcases **TypeScript** within a Next.js/React (JavaScript) ecosystem.
-   **Microsoft Technology:** While the primary AI is now Google Gemini, the project could be hosted on Azure. The prompt engineering aspects are relevant to interacting with various LLMs, including those from Microsoft/OpenAI. (If Autogen were deeply integrated, that would be a stronger Microsoft tech showcase).

**11. How well does the project implement AI technologies? Is it just a small feature or core to the functionality of the agent?**
AI is **core**. Google Gemini provides the primary analysis. Sensay is optional. The agent's main purpose is AI-driven code explanation.

**12. Is the solution an agent built with either the corresponding programming language and Autogen?**
-   Built with **TypeScript/JavaScript**.
-   It functions as an AI agent by taking input, orchestrating analysis via Genkit to Gemini, and providing structured output.
-   It does **not** currently use the **Autogen** framework in a significant way for multi-agent collaboration (though the README previously mentioned it, the current implementation focuses on Genkit and direct Gemini calls for the core explanation). The prompt to Gemini attempts to simulate a multi-persona analysis.

## ⚙️ Setup & Running

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project.
    
    **a. Google Gemini API Key:**
    You need an API key for Google Generative AI. Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```.env
    GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE
    ```

    **b. Sensay API Key (Optional):**
    If you want to use Sensay, redeem your invite code `R7YDLC4` as per previous instructions and set:
    ```.env
    SENSAY_API_KEY=sensay_sk_YourSensayApiKeyHere
    ```
    *Note: Never commit your `.env` file or your API keys directly into your code.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

**(Optional) Genkit UI (for debugging flows):**
```bash
npm run genkit:dev
# or (with file watching)
npm run genkit:watch
```
Then navigate to `http://localhost:4000` (or the port specified by Genkit).
