import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET (or AUTH_SECRET) must be set for authentication to work securely.');
  }

  const token = await getToken({ req, secret });
  const isLoggedIn = !!token;
  const isAdmin = Boolean((token as { isAdmin?: boolean } | null)?.isAdmin);
  const { pathname, search } = req.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  // Block dashboard for unauthenticated or non-admin users
  if (isDashboard) {
    if (!isLoggedIn || !isAdmin) {
      const loginUrl = new URL('/login', req.url);
     
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in as admin, redirect from /login to dashboard
  if (isLogin && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
