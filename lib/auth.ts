import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'ih_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

// Hardcoded credentials - TODO: Replace with Supabase Auth
const VALID_CREDENTIALS = [
  { email: 'nmurray@gmail.com', password: 'VancouverBC1!', role: 'admin' },
  { email: 'patient@orthopro.test', password: 'test123', role: 'patient' },
  { email: 'doctor@orthopro.test', password: 'test123', role: 'doctor' }
];

export interface SessionData {
  email: string;
  role?: string;
  createdAt: number;
}

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string): boolean {
  // Check if credentials match any valid user
  return VALID_CREDENTIALS.some(
    cred => cred.email === email && cred.password === password
  );
}

/**
 * Get user role from credentials
 */
export function getUserRole(email: string): string {
  const user = VALID_CREDENTIALS.find(cred => cred.email === email);
  return user?.role || 'patient';
}

/**
 * Create a session token (simple base64 encoded JSON for demo purposes)
 * In production, use JWT with proper signing
 */
export function createSessionToken(email: string): string {
  // Get role from credentials
  const user = VALID_CREDENTIALS.find(cred => cred.email === email);
  const sessionData: SessionData = {
    email,
    role: user?.role,
    createdAt: Date.now()
  };
  
  // Simple encoding for demo - in production use JWT with signing
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

/**
 * Decode and validate session token
 */
export function decodeSessionToken(token: string): SessionData | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const sessionData: SessionData = JSON.parse(decoded);
    
    // Check if session is expired (24 hours)
    const age = Date.now() - sessionData.createdAt;
    if (age > SESSION_MAX_AGE * 1000) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(email: string) {
  const token = createSessionToken(email);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!token) {
    return null;
  }
  
  return decodeSessionToken(token.value);
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
