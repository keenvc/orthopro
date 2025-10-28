import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, setSessionCookie, getUserRole } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    if (!validateCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user role from credentials
    const role = getUserRole(email);

    // Create session
    await setSessionCookie(email);

    return NextResponse.json(
      { success: true, email, role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
