import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Pass secret explicitly; if it's missing, skip auth enforcement to avoid runtime crashes.
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    console.warn('NEXTAUTH_SECRET is missing; middleware skipping auth enforcement.');
    return NextResponse.next();
  }

  const token = await getToken({ req, secret });
  const isLoggedIn = !!token;
  const { pathname, search } = req.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    loginUrl.searchParams.set('message', 'Log in om het dashboard te bekijken.');
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
