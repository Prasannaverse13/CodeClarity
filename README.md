
# CodeClarity 🧠 - Your AI Code Review & Explanation Agent + Code Mentor

CodeClarity is a Next.js web application designed to help users understand and improve code snippets. It leverages the **Sensay Wisdom Engine API** for detailed code explanations, analysis, and an interactive AI Code Mentor experience.

## ✨ Features

-   **Code Input:** Simple interface to paste or type code snippets.
-   **AI-Powered Explanation (Sensay Wisdom Engine):** Get detailed, step-by-step explanations of what the code does, including:
    -   Language Detection.
    -   Comprehensive Analysis (logic, purpose, inputs/outputs).
    -   Style & Formatting Suggestions.
    -   Code Smell Detection.
    -   Security Vulnerability Checks.
    -   Potential Bug Identification & Fix Suggestions.
    -   Alternative Code Approaches.
    -   General Warnings & Other Suggestions.
-   **Ask the Code Mentor (Sensay Wisdom Engine):** Engage in a conversation with an AI mentor about your code in a dedicated chat panel.
    -   Ask specific questions regarding the entered code or general programming concepts.
    -   Receive contextual answers from a Sensay AI Replica trained on coding expertise.
-   **Learn More Links:** The AI suggests relevant Google search queries to help users deepen their understanding, provided as part of the main analysis.
-   **Copy Functionality:** Easily copy the generated analysis.
-   **Clear & Explain Another:** Simple controls to clear the current analysis and input new code.
-   **Responsive Design:** Works on different screen sizes (three-column layout on wider screens).
-   **Themed UI:** Uses ShadCN UI components with a clean, professional theme.
-   **Dark/Light Mode Toggle:** User can switch between dark and light themes.

## 🚀 How It Works

The application is structured with a three-column layout:
1.  **Left Column (Code Input):** The user enters a code snippet.
2.  **Middle Column (AI Analysis):**
    -   Clicking "Explain Code" sends the code to the Next.js backend API route (`/api/ask-sensay-expert`).
    -   This API route constructs a detailed prompt asking the Sensay Wisdom Engine (via your configured Replica) for a comprehensive analysis (language, logic, suggestions, bugs, alternatives, learn more links, etc.).
    -   The structured analysis (formatted as markdown) is returned and displayed in the `CodeExplanationDisplay` component, with each section presented in its own card for clarity.
3.  **Right Column (Code Mentor Chat):**
    -   This panel allows for a conversational interaction with the Sensay AI Replica.
    -   Users can type questions or messages related to the current code snippet (or general coding queries).
    -   Each message is sent to the `/api/ask-sensay-expert` route, which relays it to the Sensay Replica.
    -   The conversation history is displayed in a chat-like interface.

All AI interactions are routed through the `/api/ask-sensay-expert` Next.js API route, which securely communicates with the Sensay Wisdom Engine API using your configured API Key, Replica ID, and User ID.

## 🧠 Sensay Wisdom Engine Integration

CodeClarity deeply integrates the Sensay Wisdom Engine API to provide its core AI functionalities:

1.  **Comprehensive Code Analysis:**
    *   When a user submits code for explanation, the backend (`/api/ask-sensay-expert/route.ts`) sends a specially crafted, detailed prompt to a **Sensay AI Replica**.
    *   This prompt instructs the Replica to analyze the code thoroughly and return a structured markdown response covering language detection, logic breakdown, style suggestions, potential bugs, security vulnerabilities, alternative approaches, and "Learn More" Google search queries.
    *   The frontend (`CodeExplanationDisplay.tsx`) then parses this markdown and presents each section in a separate, easy-to-read card.

2.  **Interactive Code Mentor:**
    *   The chat panel allows users to have an ongoing, conversational dialogue with the same **Sensay AI Replica**.
    *   This Replica is intended to be trained with extensive coding knowledge, acting as a personal AI code tutor. It can remember the context of the conversation (within Sensay's capabilities) and provide in-depth answers to follow-up questions.
    *   The backend API route (`/api/ask-sensay-expert/route.ts`) facilitates this chat by relaying user messages and Replica responses.

**Key Sensay Components Used:**
*   **Sensay AI Replica:** A specific instance of an AI model trained on the Sensay platform with coding expertise. You need to create and configure this Replica. Its ID is stored in `SENSAY_REPLICA_ID`.
*   **Sensay Organization Secret Key (`SENSAY_API_KEY`):** Your master API key for accessing Sensay services.
*   **Sensay User ID (`SENSAY_USER_ID`):** An identifier for a user within your Sensay organization who has permission to interact with the Replica.

This dual approach allows CodeClarity to offer both a structured, detailed initial analysis and a flexible, interactive mentorship experience, all powered by the Sensay Wisdom Engine.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router)
-   **AI Provider:** Sensay Wisdom Engine API
-   **UI Components:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript
-   **Icons:** Lucide React

## 🔑 Key File Locations

-   **Sensay API Interaction (Backend):** `src/app/api/ask-sensay-expert/route.ts` (Handles all interactions with the Sensay AI Replica for both full analysis and chat).
-   **Main Page UI & Logic:** `src/app/page.tsx` (Manages state, calls the backend API, renders the three-column layout including the code input, analysis display, and chat panel).
-   **Code Input Component:** `src/components/code-input.tsx` (Handles user code entry).
-   **Sensay Analysis Display Component:** `src/components/code-explanation-display.tsx` (Parses and displays the structured analysis from Sensay).
-   **Global Styles & Theme:** `src/app/globals.css` (Defines the application's theme and global styles).
-   **Theme Provider & Toggle:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx` (Manages dark/light mode).
-   **Environment Variables:** `.env` (Stores `SENSAY_API_KEY`, `SENSAY_REPLICA_ID`, `SENSAY_USER_ID`, `SENSAY_API_VERSION`).

## ⚙️ Setup & Running

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add the following:

    ```env
    # --- Sensay Wisdom Engine "Ask an Expert" Code Mentor ---
    # This is CRUCIAL for the application to function.

    # SENSAY_API_KEY is your Organization Secret Key from Sensay.
    # Example: SENSAY_API_KEY=org_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    SENSAY_API_KEY=YOUR_SENSAY_ORGANIZATION_SECRET_KEY_HERE

    # SENSAY_REPLICA_ID is the UUID of the AI Replica you create and train on the Sensay platform.
    # This is CRUCIAL. You will obtain this UUID AFTER successfully creating a Replica
    # owned by your SENSAY_USER_ID (see "Setting Up Your Sensay Code Mentor Replica" below).
    # Example: SENSAY_REPLICA_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    SENSAY_REPLICA_ID=YOUR_SENSAY_REPLICA_ID_HERE

    # SENSAY_USER_ID must correspond to a user ID you've created within
    # your Sensay organization (associated with the SENSAY_API_KEY). This user
    # MUST have access to the SENSAY_REPLICA_ID (ideally, be its owner).
    # Example: SENSAY_USER_ID=your_chosen_user_id_for_the_app
    SENSAY_USER_ID=default-codeclarity-user

    # Sensay API Version (Recommended)
    # Example: SENSAY_API_VERSION=2025-03-25
    SENSAY_API_VERSION=2025-03-25

    # Optional: For Google Gemini (if you were to re-add it)
    # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE_OR_LEAVE_BLANK_IF_NOT_USING
    ```
    *   **`SENSAY_API_KEY`**: Your **Organization Secret Key** from Sensay.
    *   **`SENSAY_REPLICA_ID`**: **CRUCIAL!** You MUST create an AI Replica on the Sensay platform, ensuring it's owned by your `SENSAY_USER_ID`, and use its unique `uuid` here. See the "Setting Up Your Sensay Code Mentor Replica" section below.
    *   **`SENSAY_USER_ID`**: **CRUCIAL!** This must be an ID of a user that exists within your Sensay organization and is the owner of (or has permission to interact with) the specified `SENSAY_REPLICA_ID`.
    *   *Note: Never commit your `.env` file or your API keys directly into your code if the repository is public.*

4.  **Set up your Sensay Code Mentor Replica:**
    Follow the detailed instructions in the "Setting Up Your Sensay Code Mentor Replica" section below. This involves using `curl` commands to create a user and a replica on the Sensay platform. **This step is mandatory for the application to work.**

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
6.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

## 🧠 Setting Up Your Sensay Code Mentor Replica

For the "Ask the Code Mentor" and "Explain Code" features to work, you **must** perform these setup steps on the Sensay platform using `curl` commands in your terminal. Replace placeholder values with your actual information.

**Your Details (from `.env` or previous interactions):**
*   Your Organization Secret Key (`SENSAY_API_KEY`): `YOUR_SENSAY_ORGANIZATION_SECRET_KEY_HERE` (Use your actual key)
*   Desired User ID for your app (`SENSAY_USER_ID`): `default-codeclarity-user` (You can choose another ID, but it must match your `.env`)
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
   Run the following `curl` command. **Choose a unique `slug` for your replica (e.g., `codeclarity-mentor-myinitials-$(date +%s)`).**

   ```bash
   # Ensure $ORGANIZATION_SECRET, $USER_ID_TO_CREATE, and $API_VERSION are still set
   # from Step 1, where $USER_ID_TO_CREATE is your SENSAY_USER_ID.
   # Choose a NEW UNIQUE SLUG.
   export REPLICA_SLUG="codeclarity-mentor-$(date +%s)" # Example for a unique slug

   curl -X POST https://api.sensay.io/v1/replicas \
     -H "X-ORGANIZATION-SECRET: $ORGANIZATION_SECRET" \
     -H "X-API-Version: $API_VERSION" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "CodeClarity Code Mentor",
       "shortDescription": "AI assistant for code understanding and mentorship.",
       "greeting": "Hi! I am the CodeClarity Code Mentor. How can I help with your code today?",
       "ownerID": "'"$USER_ID_TO_CREATE"'",  # CRITICAL: Links replica to your user
       "private": false,
       "slug": "'"$REPLICA_SLUG"'", # Use the unique slug
       "llm": { "provider": "openai", "model": "gpt-4o" } # Or your preferred LLM
     }'
   ```
   *   The response will include a `uuid`. **This `uuid` is your NEW `SENSAY_REPLICA_ID`.**
   *   **IMMEDIATELY update your `.env` file with this new `SENSAY_REPLICA_ID`**. This is the most common point of failure if it's mismatched.

**Step 3: Train this Replica (Optional but Recommended):**
   Train this newly created Replica with data relevant to coding, code review, software engineering best practices, and the style of expertise you want it to emulate. This might involve:
    -   Uploading documents (e.g., coding guidelines, API documentation).
    -   Providing example Q&A pairs related to code.
    -   Defining its personality and conversational style.
   Refer to the "Training" section in the Sensay API documentation.

**Troubleshooting Sensay API Errors:**
*   **401 Unauthorized:**
    *   `SENSAY_API_KEY` (Organization Secret) is incorrect.
    *   `SENSAY_USER_ID` does not exist in your Sensay organization.
    *   The Replica specified by `SENSAY_REPLICA_ID` is not owned by `SENSAY_USER_ID`, or the user doesn't have permission to access it.
*   **404 Not Found (Replica not found):**
    *   The `SENSAY_REPLICA_ID` in your `.env` file is incorrect or does not exist in your organization under the context of the `SENSAY_USER_ID` and `SENSAY_API_KEY`. Ensure you are using the `uuid` returned when you *successfully created the replica owned by your user*.
    *   Double-check for typos in the `SENSAY_REPLICA_ID`.

Refer to the [Sensay Documentation](https://docs.sensay.io/) for detailed instructions on these setup steps. The "Getting Started" and "Conceptual Model" sections are particularly relevant.

## How the project uses AI technologies:

*   **Core Functionality (AI-Driven):** The primary purpose of CodeClarity is to leverage the Sensay Wisdom Engine API for code explanation, review, and interactive mentorship. This is the central value proposition.
*   **Structured AI Output & Interaction:** The application is designed to receive structured (markdown) analysis from Sensay and also supports free-form conversational interaction for mentorship.
*   **Real-time Interaction:** The chat interface provides a dynamic way for users to engage with the AI mentor.

## Project Completeness & Technical Implementation:

*   **Repository Structure:** The project follows a standard Next.js structure, with clear separation for components (`src/components`) and API routes (`src/app/api`).
*   **README:** This README provides comprehensive setup instructions and feature descriptions.
*   **Security Best Practices:** API keys are managed via environment variables (`.env`) and are not hardcoded. Backend API routes handle interactions with external AI services.
*   **Robustness:** Error handling is implemented in API interactions to gracefully manage issues.
*   **Substantial Technical Implementation:** The project involves setting up API routes, managing state for a multi-column layout with chat, and crafting detailed prompts for AI interaction.

**Is the solution an agent built with JavaScript/TypeScript?**

*   Yes, the application is built with TypeScript (Next.js). The backend API route `/api/ask-sensay-expert` acts as an intermediary agent, taking user input, formatting it for the Sensay API, and relaying Sensay's AI-generated responses back to the user interface. The Sensay Replica itself is the core AI agent providing the intelligence.
    
    
