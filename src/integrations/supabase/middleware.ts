// This file is for server-side middleware if using SSR
// For client-side only, this can be left empty or used for API routes

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: Request) {
  // For client-side rendering, this middleware is not needed
  // Supabase auth is handled on the client side
  return new Response(null, { status: 200 });
}