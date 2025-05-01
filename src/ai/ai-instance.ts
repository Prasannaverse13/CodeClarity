import {genkit} from 'genkit';
// Remove Google AI plugin import as it's no longer used by default
// import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit without the Google AI plugin or a default model.
// The explain-code flow uses a specific service, not the default Genkit model.
export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    // Remove the googleAI plugin configuration
    // googleAI({
    //   apiKey: process.env.GOOGLE_GENAI_API_KEY,
    // }),
  ],
  // Remove the default model configuration
  // model: 'googleai/gemini-2.0-flash',
});
