import { createMiddlewareClient } from '@nhost/nhost-js';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Initialize Nhost client
  const nhost = createMiddlewareClient({ request, res });
  
  // Check if the user is authenticated
  const { session } = await nhost.auth.getSession();
  
  // If the user is not authenticated and trying to access protected routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is authenticated and trying to access auth pages
  if (session && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};