
# CodeClarity 🧠 - Your AI Code Review & Explanation Agent + Code Mentor

CodeClarity is a Next.js web application designed to help users understand and improve code snippets. It leverages AI models to provide detailed explanations, identify potential issues, suggest improvements, and offer deeper insights through an interactive code mentor.

## ✨ Features

-   **Code Input:** Simple interface to paste or type code snippets with line numbers.
-   **AI-Powered Explanation (Google Gemini):** Get detailed, step-by-step explanations of what the code does.
    -   Language Detection.
    -   Comprehensive Analysis covering:
        -   Style & Formatting Suggestions
        -   Code Smell Detection
        -   Security Vulnerability Checks
        -   Potential Bug Identification & Fix Suggestions
        -   Alternative Code Approaches
        -   General Warnings & Suggestions
        -   Syntax Error (Simulated) Detection
-   **Ask the Code Mentor (Sensay Wisdom Engine):** Engage in a conversation with an AI mentor about your code.
    -   Ask specific questions regarding the entered code.
    -   Receive contextual answers from a Sensay AI Replica trained on coding expertise.
    -   (Future Potential: Memory-based, evolving tutor-like chats, learning plans, persona switching).
-   **Copy Functionality:** Easily copy the generated explanation or mentor's answer.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes.
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme (supports light/dark modes based on system preference).
-   **Dark/Light Mode Toggle:** User can switch between dark and light themes.

## 🚀 How It Works

1.  **Input:** The user enters a code snippet into the enhanced text area on the left panel.
2.  **Explain Code (Google Gemini):**
    -   Clicking "Explain Code" triggers a request to the Next.js backend (Server Action implicitly via Genkit flow).
    -   The `explainCode` function in `src/ai/flows/explain-code.ts` orchestrates the process for Google Gemini model analysis.
    -   This flow uses `ai.generate()` from Genkit to interact with the configured Google Gemini model (e.g., `gemini-2.0-flash-exp`).
    -   A detailed system prompt instructs Gemini to analyze the code and return a structured JSON output.
    -   The structured analysis data is passed back to the frontend and displayed.
3.  **Ask the Code Mentor (Sensay Wisdom Engine):**
    -   The user can type a specific question about the entered code in the "Ask the Code Mentor" text area.
    -   Clicking "Ask Mentor" sends the code and the question to a Next.js API route (`/api/ask-sensay-expert`).
    -   This API route securely calls the Sensay Wisdom Engine API, interacting with a pre-trained AI Replica.
    -   The Sensay Replica processes the code and question, providing an expert-like answer.
    -   The answer is sent back to the frontend and displayed in a dedicated section.
4.  **UI Rendering:**
    -   The `CodeExplanationDisplay` component (`src/components/code-explanation-display.tsx`) renders Gemini's analysis.
    -   The `SensayExpertDisplay` component (`src/components/sensay-expert-display.tsx`) renders the Code Mentor's answer.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router, React Server Components)
-   **AI Orchestration & Interaction (Gemini):** Genkit
-   **AI Models & Services:**
    -   **Google Gemini** (e.g., `gemini-2.0-flash-exp` via Genkit `googleAI` plugin)
    -   **Sensay Wisdom Engine API** (for the "Ask an Expert" Code Mentor feature)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React

## 🔑 Key File Locations

-   **Google Gemini AI Flow Definition:** `src/ai/flows/explain-code.ts`
-   **Sensay API Interaction (Backend):** `src/app/api/ask-sensay-expert/route.ts`
-   **Genkit Configuration:** `src/ai/ai-instance.ts`
-   **Main Page UI:** `src/app/page.tsx`
-   **Code Input Component:** `src/components/code-input.tsx`
-   **Gemini Explanation Display Component:** `src/components/code-explanation-display.tsx`
-   **Sensay Mentor Answer Display Component:** `src/components/sensay-expert-display.tsx`
-   **Global Styles & Theme:** `src/app/globals.css`
-   **Theme Provider & Toggle:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

## ⚙️ Setup & Running

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add the following:
    ```env
    # For Google Gemini based code explanation
    GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE

    # For Sensay Wisdom Engine "Ask an Expert" Code Mentor
    SENSAY_API_KEY=10043e0796fd093f8a22bc3ffc09d328d96eec5df8e3779e4b7217c7e184a5eb
    SENSAY_REPLICA_ID=YOUR_SENSAY_REPLICA_ID_HERE 
    # (You need to create/train a Replica in Sensay and get its ID)
    SENSAY_USER_ID=default-codeclarity-user 
    # (Or a dynamic user ID specific to your application's users)
    SENSAY_API_VERSION=2025-03-25 
    # (Or the latest recommended by Sensay docs)
    ```
    *   **Google Gemini API Key:** Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Sensay API Key & Replica ID:**
        *   The `SENSAY_API_KEY` provided is an example. You should have your own from Sensay.
        *   `SENSAY_REPLICA_ID`: You need to create a Replica on the Sensay platform, train it with relevant coding knowledge, and then use its unique ID here.
        *   `SENSAY_USER_ID`: This is used to identify the user interacting with the Sensay replica. It can be a static ID for general use or a dynamic ID if you implement user accounts.
    *   *Note: Never commit your `.env` file or your API keys directly into your code.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

**(Optional) Genkit UI (for debugging Gemini flows):**
```bash
npm run genkit:dev
# or (with file watching)
npm run genkit:watch
```
Then navigate to `http://localhost:4000` (or the port specified by Genkit).

## 🧠 Training Your Sensay Code Mentor Replica
For the "Ask the Code Mentor" feature to be effective, you need to:
1.  Access the Sensay platform.
2.  Create a new AI Replica.
3.  Train this Replica with data relevant to coding, code review, software engineering best practices, and the style of expertise you want it to emulate. This might involve:
    -   Uploading documents (e.g., coding guidelines, API documentation).
    -   Providing example Q&A pairs related to code.
    -   Defining its personality and conversational style.
4.  Once trained and deployed, obtain the `Replica ID` and update it in your `.env` file for `SENSAY_REPLICA_ID`.
Refer to the [Sensay Documentation](https://docs.sensay.io/) for detailed instructions on creating and training Replicas.
