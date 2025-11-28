import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
if (!secret) {
  throw new Error('NEXTAUTH_SECRET (or AUTH_SECRET) must be set for authentication to work securely.');
}

const sql =
  typeof process.env.POSTGRES_URL === 'string'
    ? postgres(process.env.POSTGRES_URL, { ssl: 'require' })
    : null;

async function isCompanyAdmin(userId: string) {
  if (!sql) return false;
  const rows = await sql<{ company_id: string }[]>`
    SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
  `;
  return rows.length > 0;
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
      (session as { isAdmin?: boolean }).isAdmin = Boolean((token as { isAdmin?: boolean }).isAdmin);
      (session as { companyId?: string | null }).companyId = (token as { companyId?: string | null }).companyId ?? null;
      return session;
    },
    async jwt({ token, user }) {
      // Default to non-admin.
      let isAdmin = false;
      let companyId: string | null = null;
      const userId = user?.id ?? token.sub;
      if (userId && sql) {
        const rows = await sql<{ company_id: string }[]>`
          SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
        `;
        if (rows.length > 0) {
          isAdmin = true;
          companyId = rows[0].company_id;
        }
      }
      (token as { isAdmin?: boolean }).isAdmin = isAdmin;
      (token as { companyId?: string | null }).companyId = companyId;
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = Boolean((auth?.token as { isAdmin?: boolean })?.isAdmin);
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAuthPage = nextUrl.pathname === '/login';
      const loginUrl = new URL('/login', nextUrl);

      if (isOnDashboard && (!isLoggedIn || !isAdmin)) {
        if (!loginUrl.searchParams.has('message')) {
          loginUrl.searchParams.set('message', 'Only company admins can access the dashboard.');
        }
        return NextResponse.redirect(loginUrl);
      }

      if (isAuthPage && isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }

      // if (isLoggedIn && !isOnDashboard) {
      //   return NextResponse.redirect(new URL('/dashboard', nextUrl));
      // }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
