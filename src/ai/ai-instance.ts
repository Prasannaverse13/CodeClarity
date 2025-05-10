
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { GenkitError } from 'genkit';

let googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey && process.env.NODE_ENV === 'production') {
  // In production, we absolutely need the key.
  throw new GenkitError({
    status: 'FAILED_PRECONDITION',
    message:'GOOGLE_GENAI_API_KEY environment variable is not set. This is required for production.',
  });
} else if (!googleApiKey) {
  // In development/testing, we can warn but allow Genkit to initialize.
  // Genkit itself might throw an error later if a flow tries to use Google AI without a key.
  console.warn(
    'WARNING: GOOGLE_GENAI_API_KEY environment variable is not set. ',
    'Google AI related flows may not work. Please set it in your .env file.'
  );
  // Provide a dummy key for initialization purposes if you want Genkit to start
  // but be aware that actual calls to Google AI will fail.
  // googleApiKey = 'dummy-key-for-dev-init'; 
}


export const ai = genkit({
  promptDir: './prompts', // Keep this if you plan to use file-based prompts
  plugins: [
    // Conditionally add googleAI plugin only if an API key is available.
    // This helps prevent Genkit from throwing an error on startup if the key is missing,
    // especially in development or CI environments where it might not be configured.
    ...(googleApiKey ? [googleAI({ apiKey: googleApiKey })] : []),
  ],
  // Set a default model if you primarily use one model.
  // This can be overridden in specific prompts or generate calls.
  // model: 'googleai/gemini-1.5-flash-latest', // Example: using Gemini 1.5 Flash
  logLevel: 'debug', // Optional: 'info' or 'warn' for less verbose logging
  // enableTracing: true, // Optional: for more detailed tracing
});

