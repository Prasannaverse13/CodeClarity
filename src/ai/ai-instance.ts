
import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKeyFromEnv = process.env.GOOGLE_GENAI_API_KEY;
// Define a placeholder string that users might accidentally leave in their .env
const placeholderApiKey = "YOUR_GOOGLE_GENAI_API_KEY_HERE_OR_LEAVE_BLANK_IF_NOT_USING";

let effectiveApiKey: string | undefined = undefined;
let shouldInitializeGoogleAI = false;

if (googleApiKeyFromEnv && googleApiKeyFromEnv.trim() !== "" && googleApiKeyFromEnv !== placeholderApiKey) {
  effectiveApiKey = googleApiKeyFromEnv;
  shouldInitializeGoogleAI = true;
} else {
  if (process.env.NODE_ENV === 'production') {
    // In production, if the key is missing or placeholder, it's a critical issue.
    console.error(
      'CRITICAL ERROR: GOOGLE_GENAI_API_KEY environment variable is not set, is a placeholder, or is an empty string. ',
      'This is required for production. Please obtain a key from https://aistudio.google.com/app/apikey and set it in your .env file.'
    );
    // Depending on the app's resilience, you might want to throw an error here
    // or allow the app to start with Genkit features disabled.
    // For now, we will throw to make the issue immediately obvious in production.
    throw new GenkitError({
      status: 'FAILED_PRECONDITION',
      message: 'GOOGLE_GENAI_API_KEY environment variable is not set, is a placeholder, or is an empty string. This is required for production. Please obtain a key from https://aistudio.google.com/app/apikey and set it in your .env file.',
    });
  } else {
    // In development, warn if the key is missing, is the placeholder, or is empty.
    // The googleAI plugin will not be initialized in this case.
    console.warn(
      'WARNING: GOOGLE_GENAI_API_KEY is not set, is a placeholder, or is an empty string. ',
      'Google AI related flows will not work. Please set a valid key from https://aistudio.google.com/app/apikey in your .env file if you intend to use Google AI features.'
    );
  }
}

export const ai = genkit({
  plugins: [
    // Only initialize the googleAI plugin if a valid-looking API key is present.
    ...(shouldInitializeGoogleAI && effectiveApiKey ? [googleAI({ apiKey: effectiveApiKey })] : []),
  ],
  logLevel: 'debug', // Optional: 'info' or 'warn' for less verbose logging
  // enableTracing: true, // Optional: for more detailed tracing
});
