// src/services/sensay.ts
'use server';

/**
 * @fileOverview Service to interact with the Sensay Wisdom Engine API.
 * This service encapsulates the logic for sending requests to Sensay.
 */

const SENSAY_API_BASE_URL = 'https://api.sensay.io/v1';

// Load the Sensay API Key from environment variables.
const sensayApiKey = process.env.SENSAY_API_KEY;

if (!sensayApiKey) {
  console.warn(
    'WARNING: SENSAY_API_KEY environment variable is not set. Sensay API calls will fail authentication.'
  );
}

export interface SensayInteractionInput {
  type: 'text';
  content: string;
}

export interface SensayInteractionOutput {
  type: 'text' | 'structured' | 'tool_calls' | string; // Allow for other types Sensay might return
  content?: string; // Present if type is 'text'
  // Add other fields if dealing with structured output later
  [key: string]: any; // Allow other properties for structured output
}

export interface SensayInteractionResponse {
  id: string;
  created_at: string;
  updated_at: string;
  agent_id?: string;
  context_id?: string;
  session_id?: string;
  status: string; // e.g., "completed", "processing"
  input: SensayInteractionInput;
  output?: SensayInteractionOutput;
  error?: any;
  metadata?: any;
}

/**
 * Creates an interaction with the Sensay Wisdom Engine.
 *
 * @param inputText The text input for Sensay (e.g., a code snippet or a question).
 * @param agentId Optional ID of a specific Sensay agent to use.
 * @returns A promise that resolves to the SensayInteractionResponse object.
 * @throws Throws an error if SENSAY_API_KEY is not configured or if the API call fails.
 */
export async function getSensayInteraction(
  inputText: string,
  agentId?: string
): Promise<SensayInteractionResponse> {
  if (!sensayApiKey) {
    throw new Error(
      'Configuration Error: SENSAY_API_KEY is not configured. Cannot call the Sensay API.'
    );
  }

  const requestBody: {
    input: SensayInteractionInput;
    agent_id?: string;
  } = {
    input: {
      type: 'text',
      content: inputText,
    },
  };

  if (agentId) {
    requestBody.agent_id = agentId;
  }

  try {
    console.log('Sending request to Sensay API...');
    const response = await fetch(`${SENSAY_API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sensayApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Received response from Sensay API with status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response from Sensay API' }));
      console.error('Sensay API Error Response:', errorBody);
      throw new Error(
        `Sensay API request failed with status ${response.status}: ${
          errorBody?.message || errorBody?.error?.message || 'Unknown Sensay API error'
        }`
      );
    }

    const responseData: SensayInteractionResponse = await response.json();
    
    // Basic validation of response structure
    if (!responseData.id || !responseData.status) {
        console.error('Invalid response structure from Sensay:', responseData);
        throw new Error('Received an invalid or incomplete response structure from Sensay API.');
    }
    if (responseData.status === 'failed' || responseData.error) {
        console.error('Sensay interaction failed:', responseData.error || 'Unknown error');
        throw new Error(`Sensay interaction processed with error: ${responseData.error?.message || 'Sensay processing error'}`);
    }


    console.log('Successfully received and parsed Sensay API response.');
    return responseData;
  } catch (error) {
    console.error('Error interacting with Sensay API:', error);
    if (error instanceof Error) {
      throw new Error(`Sensay Service Error: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred in the Sensay service.');
    }
  }
}