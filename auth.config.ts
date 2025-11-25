import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthPage = nextUrl.pathname === '/login';
      const loginUrl = new URL('/login', nextUrl);

      if (isOnDashboard && !isLoggedIn) {
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
        loginUrl.searchParams.set('message', 'Log in om het dashboard te bekijken.');
        return NextResponse.redirect(loginUrl);
      }

      if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }

      if (isLoggedIn && !isOnDashboard) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
