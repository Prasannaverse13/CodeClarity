
# CodeClarity 🧠 - Your AI Code Review & Explanation Agent

CodeClarity is a Next.js web application designed to help users understand and improve code snippets using AI-powered analysis. It leverages **Google Gemini** (via Genkit) to provide detailed explanations, identify potential issues, suggest improvements, and offer deeper insights.

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
6.  **UI Rendering:** The `CodeExplanationDisplay` component (`src/components/code-explanation-display.tsx`) renders all analyses.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router, React Server Components)
-   **AI Orchestration & Interaction:** Genkit
-   **AI Models & Services:**
    -   **Google Gemini** (e.g., `gemini-1.5-flash-latest` via Genkit `googleAI` plugin)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React

## 🔑 Key File Locations

-   **Google Gemini AI Flow Definition:** `src/ai/flows/explain-code.ts` (Uses Genkit `ai.generate()`)
-   **Genkit Configuration:** `src/ai/ai-instance.ts` (Configures `googleAI` plugin)
-   **Main Page UI:** `src/app/page.tsx`
-   **Code Input Component:** `src/components/code-input.tsx`
-   **Explanation Display Component:** `src/components/code-explanation-display.tsx`
-   **Global Styles & Theme:** `src/app/globals.css`
-   **Theme Provider & Toggle:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

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
