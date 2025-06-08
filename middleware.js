import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the request is for admin routes (except login)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Check if user has authentication token
    const token = request.cookies.get('firebase-token');
    
    if (!token || !token.value) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};