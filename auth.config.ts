import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
if (!secret) {
  throw new Error('NEXTAUTH_SECRET (or AUTH_SECRET) must be set for authentication to work securely.');
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret,
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthPage = nextUrl.pathname === '/login';
      const loginUrl = new URL('/login', nextUrl);

      if (isOnDashboard && !isLoggedIn) {
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
