import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET!;
const JWT_TOKEN = process.env.RINGCENTRAL_JWT!;

export async function GET() {
  try {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://platform.ringcentral.com/restapi/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${JWT_TOKEN}`
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Authentication failed', details: error }, { status: 401 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      scope: data.scope
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
