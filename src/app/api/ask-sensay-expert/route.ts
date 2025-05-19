// src/app/api/ask-sensay-expert/route.ts
import { NextRequest, NextResponse } from 'next/server';

const sensayApiKey = process.env.SENSAY_API_KEY;
const sensayReplicaId = process.env.SENSAY_REPLICA_ID;
const sensayUserId = process.env.SENSAY_USER_ID;
const sensayApiVersion = process.env.SENSAY_API_VERSION || '2025-03-25';
const sensayApiBaseUrl = 'https://api.sensay.io/v1';

export async function POST(req: NextRequest) {
  if (!sensayApiKey) {
    console.error('SENSAY_API_KEY is not set.');
    return NextResponse.json({ error: 'Sensay API key not configured.' }, { status: 500 });
  }
  if (!sensayReplicaId || sensayReplicaId === 'YOUR_SENSAY_REPLICA_ID_HERE') {
    console.error('SENSAY_REPLICA_ID is not set or is a placeholder.');
    return NextResponse.json({ error: 'Sensay Replica ID not configured.' }, { status: 500 });
  }
   if (!sensayUserId) {
    console.error('SENSAY_USER_ID is not set.');
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

    const endpointUrl = `${sensayApiBaseUrl}/replicas/${sensayReplicaId}/chat/completions`;

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': sensayApiKey,
        'X-USER-ID': sensayUserId,
        'X-API-Version': sensayApiVersion,
      },
      body: JSON.stringify({
        content: promptContent,
        // Add other parameters like 'skip_chat_history' if needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to parse error response from Sensay" }));
      console.error('Error from Sensay API:', response.status, errorData);
      return NextResponse.json(
        { error: `Sensay API error: ${errorData?.error || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.success && data.content) {
      return NextResponse.json({ expertAnswer: data.content });
    } else {
      console.error('Unexpected response format from Sensay API:', data);
      return NextResponse.json({ error: 'No expert answer received or unexpected format from Sensay API.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing Sensay request:', error);
    const message = error instanceof Error ? error.message : 'Failed to process the request.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
