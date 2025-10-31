import { NextRequest, NextResponse } from 'next/server';
import { osmindClient } from '../../../../lib/osmind/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing username or password' },
        { status: 400 }
      );
    }

    const result = await osmindClient.login(username, password);

    return NextResponse.json({
      success: true,
      message: 'Successfully logged into Osmind',
      token: result.session_token || result.token,
    });
  } catch (error) {
    console.error('Osmind login error:', error);
    return NextResponse.json(
      {
        error: 'Login failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 401 }
    );
  }
}
