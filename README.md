
# CodeClarity 🧠 - Your AI Code Review & Explanation Agent + Code Mentor

CodeClarity is a Next.js web application designed to help users understand and improve code snippets. It leverages Google Gemini for detailed code explanations and can integrate with the Sensay Wisdom Engine for an interactive AI Code Mentor experience.

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
-   **Ask the Code Mentor (Sensay Wisdom Engine - Optional Integration):** Engage in a conversation with an AI mentor about your code.
    -   Ask specific questions regarding the entered code.
    -   Receive contextual answers from a Sensay AI Replica trained on coding expertise.
-   **Copy Functionality:** Easily copy the generated explanation or mentor's answer.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes.
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme.
-   **Dark/Light Mode Toggle:** User can switch between dark and light themes.

## 🚀 How It Works

1.  **Input:** The user enters a code snippet into the enhanced text area on the left panel.
2.  **Explain Code (Google Gemini):**
    -   Clicking "Explain Code" triggers a request to the Next.js backend (Server Action implicitly via Genkit flow).
    -   The `explainCode` function in `src/ai/flows/explain-code.ts` orchestrates the process for Google Gemini model analysis.
    -   This flow uses `ai.generate()` from Genkit to interact with the configured Google Gemini model (e.g., `gemini-2.0-flash-exp`).
    -   A detailed system prompt instructs Gemini to analyze the code and return a structured JSON output.
    -   The structured analysis data is passed back to the frontend and displayed.
3.  **Ask the Code Mentor (Sensay Wisdom Engine - If Configured):**
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
    -   **Sensay Wisdom Engine API** (for the "Ask an Expert" Code Mentor feature - optional)
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React

## 🔑 Key File Locations

-   **Google Gemini AI Flow Definition:** `src/ai/flows/explain-code.ts`
-   **Sensay API Interaction (Backend):** `src/app/api/ask-sensay-expert/route.ts` (Handles "Ask Mentor")
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

    # --- Sensay Wisdom Engine "Ask an Expert" Code Mentor (Optional) ---
    # If you do not wish to use the Sensay Code Mentor, you can leave these blank
    # or remove them. The "Ask Mentor" feature will be gracefully disabled.

    # SENSAY_API_KEY is your Organization Secret Key from Sensay.
    # Example: SENSAY_API_KEY=10043e0796fd093f8a22bc3ffc09d328d96eec5df8e3779e4b7217c7e184a5eb
    SENSAY_API_KEY=YOUR_SENSAY_ORGANIZATION_SECRET_KEY_HERE
    
    # SENSAY_REPLICA_ID is the UUID of the AI Replica you create and train on the Sensay platform.
    # This is CRUCIAL for the "Ask Mentor" feature.
    # Example: SENSAY_REPLICA_ID=cbb19521-47b2-4371-b907-40f174f954f8
    SENSAY_REPLICA_ID=YOUR_SENSAY_REPLICA_ID_HERE 
    
    # SENSAY_USER_ID must correspond to a user ID you've created within
    # your Sensay organization (associated with the SENSAY_API_KEY). This user
    # MUST have access to the SENSAY_REPLICA_ID.
    # Example: SENSAY_USER_ID=default-codeclarity-user
    SENSAY_USER_ID=YOUR_SENSAY_USER_ID_HERE
    
    # Sensay API Version (Recommended)
    # Example: SENSAY_API_VERSION=2025-03-25
    SENSAY_API_VERSION=2025-03-25
    ```
    *   **`GOOGLE_GENAI_API_KEY`:** Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Sensay Credentials (for "Ask Mentor" feature):**
        *   `SENSAY_API_KEY`: This is your **Organization Secret Key** obtained from Sensay (e.g., after redeeming an invite code). **Do not include `sensay_sk_` prefix unless explicitly part of the key Sensay provides directly.**
        *   `SENSAY_REPLICA_ID`: **CRUCIAL!** You MUST create an AI Replica on the Sensay platform ([https://sensay.io/](https://sensay.io/)), train it, and use its unique ID here.
        *   `SENSAY_USER_ID`: **CRUCIAL!** This must be an ID of a user that exists within your Sensay organization and has permission to interact with the specified `SENSAY_REPLICA_ID`. See the "Setting Up Your Sensay Code Mentor Replica" section below.
    *   *Note: Never commit your `.env` file or your API keys directly into your code if the repository is public.*

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

## 🧠 Setting Up Your Sensay Code Mentor Replica (For "Ask Mentor" Feature)

For the "Ask the Code Mentor" feature to work, you **must** perform these setup steps on the Sensay platform:

1.  **Obtain Sensay Organization Secret Key (`SENSAY_API_KEY`):**
    *   If you have an invite code, redeem it via the Sensay API: `POST /v1/api-keys/invites/{code}/redeem`. This will provide your Organization Secret Key.
    *   Store this key as `SENSAY_API_KEY` in your `.env` file.

2.  **Create a User (`SENSAY_USER_ID`):**
    *   Every interaction with a Sensay replica is associated with a user. You need to create a user within your Sensay organization.
    *   Use the Sensay API: `POST /v1/users`. You can specify an ID (e.g., `default-codeclarity-user`) or let Sensay generate one.
        ```bash
        # Replace $YOUR_ORG_SECRET with your actual SENSAY_API_KEY
        curl -X POST https://api.sensay.io/v1/users \
         -H "X-ORGANIZATION-SECRET: $YOUR_ORG_SECRET" \
         -H "X-API-Version: 2025-03-25" \
         -H "Content-Type: application/json" \
         -d '{"id": "default-codeclarity-user"}' 
        ```
    *   Store the chosen or generated user ID as `SENSAY_USER_ID` in your `.env` file.

3.  **Create an AI Replica (`SENSAY_REPLICA_ID`):**
    *   Create a new AI Replica via the Sensay platform or API: `POST /v1/replicas`.
        ```bash
        # Replace $YOUR_ORG_SECRET and $YOUR_USER_ID accordingly
        curl -X POST https://api.sensay.io/v1/replicas \
         -H "X-ORGANIZATION-SECRET: $YOUR_ORG_SECRET" \
         -H "X-API-Version: 2025-03-25" \
         -H "Content-Type: application/json" \
         -d '{
           "name": "CodeClarity Code Mentor",
           "shortDescription": "AI assistant for code understanding.",
           "greeting": "Hi! I am the CodeClarity Code Mentor. How can I help with your code?",
           "ownerID": "$YOUR_USER_ID", // This links the replica to the user
           "private": false, // Or true, depending on your needs
           "slug": "codeclarity-code-mentor", 
           "llm": { "provider": "openai", "model": "gpt-4o" } // Or your preferred LLM
         }'
        ```
    *   The API response will include a `uuid` for the created replica. This is your `SENSAY_REPLICA_ID`.
    *   Store this `uuid` as `SENSAY_REPLICA_ID` in your `.env` file.

4.  **Train this Replica:**
    *   Train this Replica with data relevant to coding, code review, software engineering best practices, and the style of expertise you want it to emulate. This might involve:
        -   Uploading documents (e.g., coding guidelines, API documentation).
        -   Providing example Q&A pairs related to code.
        -   Defining its personality and conversational style.
    *   Refer to the "Training" section in the Sensay API documentation.

**Troubleshooting Sensay 401 Unauthorized Errors:**
A "401 Unauthorized" error from the Sensay API almost always means there's a mismatch or permission issue with your `SENSAY_API_KEY`, `SENSAY_USER_ID`, and `SENSAY_REPLICA_ID` on the Sensay platform.
*   Ensure `SENSAY_API_KEY` is the correct Organization Secret.
*   Ensure `SENSAY_USER_ID` **exists** within that organization.
*   Ensure the `SENSAY_REPLICA_ID` **belongs to that organization** AND the `SENSAY_USER_ID` is authorized to access it (e.g., is the `ownerID`).

Refer to the [Sensay Documentation](https://docs.sensay.io/) for detailed instructions on these setup steps. The "Getting Started" and "Conceptual Model" sections are particularly relevant.
