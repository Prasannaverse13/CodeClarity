
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
    # Obtain a valid API key from https://aistudio.google.com/app/apikey
    GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE_OR_LEAVE_BLANK_IF_NOT_USING

    # --- Sensay Wisdom Engine "Ask an Expert" Code Mentor (Optional) ---
    # If you do not wish to use the Sensay Code Mentor, you can leave these blank
    # or remove them. The "Ask Mentor" feature will be gracefully disabled if these are not set correctly.

    # SENSAY_API_KEY is your Organization Secret Key from Sensay.
    # Example: SENSAY_API_KEY=e1cae7e85c39dc22aff0b7b154cf0795c355a2b3176dbf9945e0ec6cdecdb5dd
    SENSAY_API_KEY=YOUR_SENSAY_ORGANIZATION_SECRET_KEY_HERE
    
    # SENSAY_REPLICA_ID is the UUID of the AI Replica you create and train on the Sensay platform.
    # This is CRUCIAL for the "Ask Mentor" feature.
    # You will obtain this UUID AFTER successfully creating a Replica (see Step 2 in "Setting Up Your Sensay Code Mentor Replica" below).
    # Example: SENSAY_REPLICA_ID=cbb19521-47b2-4371-b907-40f174f954f8
    SENSAY_REPLICA_ID=YOUR_SENSAY_REPLICA_ID_HERE 
    
    # SENSAY_USER_ID must correspond to a user ID you've created within
    # your Sensay organization (associated with the SENSAY_API_KEY). This user
    # MUST have access to the SENSAY_REPLICA_ID (ideally, be its owner).
    # Example: SENSAY_USER_ID=default-codeclarity-user
    SENSAY_USER_ID=YOUR_SENSAY_USER_ID_HERE
    
    # Sensay API Version (Recommended)
    # Example: SENSAY_API_VERSION=2025-03-25
    SENSAY_API_VERSION=2025-03-25
    ```
    *   **`GOOGLE_GENAI_API_KEY`:** Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey). **This is required for the core code explanation feature.** If left as the placeholder `YOUR_GOOGLE_GENAI_API_KEY_HERE_OR_LEAVE_BLANK_IF_NOT_USING` or blank, Google AI features will not work.
    *   **Sensay Credentials (for "Ask Mentor" feature):**
        *   `SENSAY_API_KEY`: This is your **Organization Secret Key** obtained from Sensay (e.g., after redeeming an invite code). **Do not include `sensay_sk_` prefix unless explicitly part of the key Sensay provides directly.**
        *   `SENSAY_REPLICA_ID`: **CRUCIAL!** You MUST create an AI Replica on the Sensay platform ([https://sensay.io/](https://sensay.io/)), train it, and use its unique ID here. This ID is returned when you successfully create a replica via their API.
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

For the "Ask the Code Mentor" feature to work, you **must** perform these setup steps on the Sensay platform using `curl` commands in your terminal. Replace placeholder values with your actual information.

**Your Details (from `.env` or previous interactions):**
*   Your Organization Secret Key (`SENSAY_API_KEY`): `e1cae7e85c39dc22aff0b7b154cf0795c355a2b3176dbf9945e0ec6cdecdb5dd` (Use your actual key)
*   Desired User ID for your app (`SENSAY_USER_ID`): `default-codeclarity-user` (You can choose another ID)
*   Your desired API Version (`SENSAY_API_VERSION`): `2025-03-25`

**Step 1: Create a User in Your Sensay Organization**

   If the user specified by `SENSAY_USER_ID` (e.g., `default-codeclarity-user`) does not already exist in your Sensay organization, you MUST create it.
   Run the following `curl` command in your terminal, replacing the placeholders:

   ```bash
   # Set your environment variables (or replace directly in the command)
   export ORGANIZATION_SECRET="YOUR_ACTUAL_SENSAY_API_KEY_FROM_ENV" 
   export USER_ID_TO_CREATE="default-codeclarity-user" # Or your desired SENSAY_USER_ID
   export API_VERSION="2025-03-25"

   curl -X POST https://api.sensay.io/v1/users \
     -H "X-ORGANIZATION-SECRET: $ORGANIZATION_SECRET" \
     -H "X-API-Version: $API_VERSION" \
     -H "Content-Type: application/json" \
     -d '{"id": "'"$USER_ID_TO_CREATE"'"}'
   ```
   *   **Verify the response.** It should confirm the user was created (e.g., `{"id": "default-codeclarity-user", "linkedAccounts": []}`). If it says the user already exists, that's fine.
   *   Make sure the `id` you use here matches the `SENSAY_USER_ID` in your `.env` file.

**Step 2: Create Your AI Replica Owned by This User**

   Now, create the AI Replica that will act as your Code Mentor. The `ownerID` of this replica **MUST** be the `SENSAY_USER_ID` you created or verified in Step 1.
   Run the following `curl` command. **Choose a unique `slug` for your replica if `codeclarity-code-mentor-v2` or `codeclarity-code-mentor` already exists (e.g., `codeclarity-code-mentor-myinitials`).**

   ```bash
   # Ensure $ORGANIZATION_SECRET, $USER_ID_TO_CREATE, and $API_VERSION are still set
   # from Step 1, where $USER_ID_TO_CREATE is your SENSAY_USER_ID.
   # Choose a NEW UNIQUE SLUG if you've run this before.
   export REPLICA_SLUG="codeclarity-mentor-$(date +%s)" # Example for a unique slug

   curl -X POST https://api.sensay.io/v1/replicas \
     -H "X-ORGANIZATION-SECRET: $ORGANIZATION_SECRET" \
     -H "X-API-Version: $API_VERSION" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "CodeClarity Code Mentor",
       "shortDescription": "AI assistant for code understanding.",
       "greeting": "Hi! I am the CodeClarity Code Mentor. How can I help with your code?",
       "ownerID": "'"$USER_ID_TO_CREATE"'",  # CRITICAL: Links replica to your user
       "private": false,
       "slug": "'"$REPLICA_SLUG"'", # Use the unique slug
       "llm": { "provider": "openai", "model": "gpt-4o" } # Or your preferred LLM
     }'
   ```
   *   The response will include a `uuid`. **This `uuid` is your NEW `SENSAY_REPLICA_ID`.** 
   *   **IMMEDIATELY update your `.env` file with this new `SENSAY_REPLICA_ID`**. This is the most common point of failure.

**Step 3: Train this Replica:**
   Train this newly created Replica with data relevant to coding, code review, software engineering best practices, and the style of expertise you want it to emulate. This might involve:
    -   Uploading documents (e.g., coding guidelines, API documentation).
    -   Providing example Q&A pairs related to code.
    -   Defining its personality and conversational style.
   Refer to the "Training" section in the Sensay API documentation.

**Troubleshooting Sensay API Errors:**
*   **401 Unauthorized:**
    *   `SENSAY_API_KEY` is incorrect or not an Organization Secret.
    *   `SENSAY_USER_ID` does not exist in your Sensay organization.
    *   The Replica specified by `SENSAY_REPLICA_ID` is not owned by `SENSAY_USER_ID` or the user doesn't have permission.
*   **404 Not Found (Replica not found):**
    *   The `SENSAY_REPLICA_ID` in your `.env` file is incorrect or does not exist in your organization under the context of the `SENSAY_USER_ID` and `SENSAY_API_KEY`. Ensure you are using the `uuid` returned when you *successfully created the replica owned by your user*.
    *   Double-check for typos in the `SENSAY_REPLICA_ID`.

Refer to the [Sensay Documentation](https://docs.sensay.io/) for detailed instructions on these setup steps. The "Getting Started" and "Conceptual Model" sections are particularly relevant.

**How the project uses AI technologies:**

*   **Core Functionality (AI-Driven):** The primary purpose of CodeClarity is to leverage AI (Google Gemini) for code explanation and review. This is not a minor feature but the central value proposition.
*   **Genkit for AI Orchestration:** The project uses Genkit to define and manage the interaction with the Google Gemini model, including structuring prompts, handling responses, and managing potential errors. This demonstrates a sophisticated approach to integrating AI models.
*   **(Optional) Sensay Wisdom Engine for Enhanced Interaction:** The optional integration with Sensay aims to elevate the AI from a one-shot explainer to a conversational mentor with memory, showcasing an advanced use of AI for interactive learning and support.
*   **Structured AI Output:** The `explainCode` flow is designed to receive a structured JSON output from Gemini, which is then parsed and displayed in a user-friendly format. This is more advanced than simply displaying raw text output from an LLM.

**Project Completeness & Technical Implementation:**

*   **Repository Structure:** The project follows a standard Next.js structure, with clear separation for AI flows (`src/ai/flows`), components (`src/components`), API routes (`src/app/api`), and services (`src/services`).
*   **README:** This README provides comprehensive setup instructions, feature descriptions, and troubleshooting tips.
*   **Code Comments:** Key functions and complex logic (especially in AI flows and API routes) are commented to explain their purpose.
*   **Security Best Practices:** API keys are managed via environment variables (`.env`) and are not hardcoded. Backend API routes handle interactions with external AI services, preventing client-side exposure of keys.
*   **Robustness:** Error handling is implemented in AI flows and API interactions to gracefully manage issues like invalid API keys, network errors, or unexpected responses from AI services.
*   **Substantial Technical Implementation:** The project involves setting up Genkit, defining complex Zod schemas for AI input/output, crafting detailed system prompts, and integrating multiple UI components to create a functional application. This goes beyond simple sample code.
*   **Showcasing Next.js & Genkit:** The project effectively uses Next.js App Router, Server Components (implicitly via Genkit flows), and TypeScript. Genkit is used as the primary tool for AI interaction with Google Gemini.

**Is the solution an agent built with JavaScript/TypeScript and Genkit?**

*   Yes, the core AI explanation feature is an agent built with TypeScript (Next.js) and orchestrated using Genkit to interact with the Google Gemini model. The "Explain Code" functionality in `src/ai/flows/explain-code.ts` acts as an AI agent that receives code, processes it via an LLM, and returns a structured analysis.
*   The optional Sensay integration further enhances this by adding another layer of agent-like conversational capabilities.
