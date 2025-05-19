
// src/app/api/ask-sensay-expert/route.ts
import { NextRequest, NextResponse } from 'next/server';

const sensayApiKey = process.env.SENSAY_API_KEY;
const sensayReplicaId = process.env.SENSAY_REPLICA_ID;
const sensayUserId = process.env.SENSAY_USER_ID;
const sensayApiVersion = process.env.SENSAY_API_VERSION || '2025-03-25';
const sensayApiBaseUrl = 'https://api.sensay.io/v1';

// Log the values read from environment variables for debugging
console.log('[Sensay API Route] Initializing...');
console.log(`[Sensay API Route] SENSAY_API_KEY loaded: ${sensayApiKey ? 'Exists (starts with: ' + sensayApiKey.substring(0,10) + '...)' : 'MISSING_OR_EMPTY'}`);
console.log(`[Sensay API Route] SENSAY_REPLICA_ID loaded: "${sensayReplicaId}"`);
console.log(`[Sensay API Route] SENSAY_USER_ID loaded: "${sensayUserId}"`);
console.log(`[Sensay API Route] SENSAY_API_VERSION: "${sensayApiVersion}"`);
console.log(`[Sensay API Route] SENSAY_API_BASE_URL: "${sensayApiBaseUrl}"`);


export async function POST(req: NextRequest) {
  console.log('[Sensay API Route] POST request received.');
  // Re-check and log critical variables inside the POST handler
  const currentSensayApiKey = process.env.SENSAY_API_KEY;
  const currentSensayReplicaId = process.env.SENSAY_REPLICA_ID;
  const currentSensayUserId = process.env.SENSAY_USER_ID;

  console.log(`[Sensay API Route - POST] SENSAY_API_KEY check: ${currentSensayApiKey ? 'Exists' : 'MISSING_OR_EMPTY'}`);
  console.log(`[Sensay API Route - POST] SENSAY_REPLICA_ID check: "${currentSensayReplicaId}"`);
  console.log(`[Sensay API Route - POST] SENSAY_USER_ID check: "${currentSensayUserId}"`);


  if (!currentSensayApiKey) {
    console.error('[Sensay API Route - POST] SENSAY_API_KEY is not set.');
    return NextResponse.json({ error: 'Sensay API key not configured.' }, { status: 500 });
  }
  if (!currentSensayReplicaId || currentSensayReplicaId === 'YOUR_SENSAY_REPLICA_ID_HERE' || currentSensayReplicaId === 'cbb19521-47b2-4371-b907-40f174f954f8') { // Added check for placeholder
    console.error(`[Sensay API Route - POST] SENSAY_REPLICA_ID is not set or is a placeholder. Value: "${currentSensayReplicaId}"`);
    return NextResponse.json({ error: 'Sensay Replica ID not configured.' }, { status: 500 });
  }
   if (!currentSensayUserId) {
    console.error('[Sensay API Route - POST] SENSAY_USER_ID is not set.');
    return NextResponse.json({ error: 'Sensay User ID not configured.' }, { status: 500 });
  }

  try {
    const { code, question } = await req.json();

    if (!code || !question) {
      return NextResponse.json({ error: 'Missing code or question in the request.' }, { status: 400 });
    }

    const promptContent = `Regarding the following code snippet:
\`\`\`
${code}
\`\`\`
User's question: ${question}`;

    const endpointUrl = `${sensayApiBaseUrl}/replicas/${currentSensayReplicaId}/chat/completions`;
    console.log(`[Sensay API Route - POST] Calling Sensay endpoint: ${endpointUrl}`);

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': currentSensayApiKey, // Corrected header for API Key
        'X-USER-ID': currentSensayUserId,
        'X-API-Version': sensayApiVersion,
      },
      body: JSON.stringify({
        content: promptContent,
        // Add other parameters like 'skip_chat_history' if needed based on Sensay docs for this endpoint
      }),
    });

    console.log(`[Sensay API Route - POST] Response status from Sensay: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response from Sensay API' }));
      console.error(`[Sensay API Route - POST] Error from Sensay API. Status: ${response.status}, Body:`, errorBody);
      // Provide a more descriptive error if possible
      const errorDetail = typeof errorBody.error === 'string' ? errorBody.error : JSON.stringify(errorBody);
      return NextResponse.json(
        { error: `Sensay API error: ${response.statusText} - ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Sensay API Route - POST] Successfully received and parsed data from Sensay.');


    // Adjust based on the actual structure of Sensay's response for chat completions
    // The documentation example shows a direct "content" field in the response.
    if (data.success && data.content) {
      return NextResponse.json({ expertAnswer: data.content });
    } else if (data.content) { // Fallback if success field is not present but content is
       return NextResponse.json({ expertAnswer: data.content });
    }
    else {
      console.error('[Sensay API Route - POST] Unexpected response format from Sensay API:', data);
      return NextResponse.json({ error: 'No expert answer received or unexpected format from Sensay API.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[Sensay API Route - POST] Error processing Sensay request:', error);
    const message = error instanceof Error ? error.message : 'Failed to process the request.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
