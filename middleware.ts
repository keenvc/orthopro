import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'ih_session';

// Routes that don't require authentication
const publicRoutes = ['/login'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

function decodeSessionToken(token: string): any | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const sessionData = JSON.parse(decoded);
    
    // Check if session is expired (24 hours)
    const age = Date.now() - sessionData.createdAt;
    if (age > 60 * 60 * 24 * 1000) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie ? decodeSessionToken(sessionCookie.value) : null;
  const isAuthenticated = session !== null;

  // If trying to access auth routes while authenticated, redirect to dashboard
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected routes without authentication, redirect to login
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
