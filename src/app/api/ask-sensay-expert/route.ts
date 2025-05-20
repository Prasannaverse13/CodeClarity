
// src/app/api/ask-sensay-expert/route.ts
import { NextRequest, NextResponse } from 'next/server';

const sensayApiKey = process.env.SENSAY_API_KEY;
const sensayReplicaId = process.env.SENSAY_REPLICA_ID;
const sensayUserId = process.env.SENSAY_USER_ID;
const sensayApiVersion = process.env.SENSAY_API_VERSION || '2025-03-25';
const sensayApiBaseUrl = 'https://api.sensay.io/v1';

console.log('[Sensay API Route] Initializing...');
console.log(`[Sensay API Route] SENSAY_API_KEY loaded: ${sensayApiKey ? `Exists (starts with: ${sensayApiKey.substring(0,10)}...)` : 'MISSING_OR_EMPTY'}`);
console.log(`[Sensay API Route] SENSAY_REPLICA_ID loaded: "${sensayReplicaId}"`);
console.log(`[Sensay API Route] SENSAY_USER_ID loaded: "${sensayUserId}"`);

export async function POST(req: NextRequest) {
  console.log('[Sensay API Route] POST request received.');
  const currentSensayApiKey = process.env.SENSAY_API_KEY;
  const currentSensayReplicaId = process.env.SENSAY_REPLICA_ID;
  const currentSensayUserId = process.env.SENSAY_USER_ID;

  if (!currentSensayApiKey) {
    console.error('[Sensay API Route - POST] SENSAY_API_KEY is not set.');
    return NextResponse.json({ error: 'Sensay API key not configured.' }, { status: 500 });
  }
  if (!currentSensayReplicaId || currentSensayReplicaId === 'YOUR_SENSAY_REPLICA_ID_HERE') {
    console.error(`[Sensay API Route - POST] SENSAY_REPLICA_ID is not set or is still the default placeholder. Value: "${currentSensayReplicaId}"`);
    return NextResponse.json({ error: 'Sensay Replica ID not configured. Please set your actual Replica ID in the .env file.' }, { status: 500 });
  }
   if (!currentSensayUserId) {
    console.error('[Sensay API Route - POST] SENSAY_USER_ID is not set.');
    return NextResponse.json({ error: 'Sensay User ID not configured.' }, { status: 500 });
  }

  try {
    const { code, question, isGeneralExplanationRequest } = await req.json();

    if (!question) { // Code can be empty for general chat
      return NextResponse.json({ error: 'Missing question in the request.' }, { status: 400 });
    }

    let promptContent = question; // Default to the direct question

    if (isGeneralExplanationRequest && code) {
      // The 'question' already contains the detailed prompt for full analysis
      promptContent = question;
    } else if (code) { // For direct chat, prepend code context if available
      promptContent = `Regarding the following code snippet:
\`\`\`
${code}
\`\`\`
User's message: ${question}

Please provide a helpful and concise answer. If the user asks for learning resources, suggest 2-3 relevant Google search query strings (not full URLs, e.g., "- Python list comprehensions tutorial").`;
    } else {
       // If no code context, it's a general chat message
       promptContent = `User's message: ${question}\nPlease provide a helpful and concise answer. If the user asks for learning resources, suggest 2-3 relevant Google search query strings.`;
    }


    const endpointUrl = `${sensayApiBaseUrl}/replicas/${currentSensayReplicaId}/chat/completions`;
    console.log(`[Sensay API Route - POST] Calling Sensay endpoint: ${endpointUrl} for ${isGeneralExplanationRequest ? 'full analysis' : 'chat'}`);

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': currentSensayApiKey,
        'X-USER-ID': currentSensayUserId,
        'X-API-Version': sensayApiVersion,
      },
      body: JSON.stringify({
        content: promptContent,
        // skip_chat_history: isGeneralExplanationRequest ? true : false, // For full analysis, don't pollute chat history
      }),
    });

    console.log(`[Sensay API Route - POST] Response status from Sensay: ${response.status}`);

    if (!response.ok) {
      const errorBodyText = await response.text();
      let errorDetail = `Sensay API error: ${response.statusText}`;
      try {
        const errorBodyJson = JSON.parse(errorBodyText);
        errorDetail = typeof errorBodyJson.error === 'string' ? errorBodyJson.error : JSON.stringify(errorBodyJson);
      } catch (e) {
        errorDetail = errorBodyText || errorDetail;
      }
      console.error(`[Sensay API Route - POST] Error from Sensay API. Status: ${response.status}, Body:`, errorBodyText);
      return NextResponse.json(
        { error: `Sensay API error: ${response.statusText} - ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Sensay API Route - POST] Successfully received and parsed data from Sensay.');

    if (data.success && data.content) {
      return NextResponse.json({ expertAnswer: data.content });
    } else if (data.content) {
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
