'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  redirectAuthenticatedTo?: string;
  requiresAuth?: boolean;
};

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  redirectAuthenticatedTo,
  requiresAuth = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated' && requiresAuth) {
      const callbackUrl = encodeURIComponent(pathname || '/dashboard');
      router.replace(`${redirectTo}?callbackUrl=${callbackUrl}&message=Log in om het dashboard te bekijken.`);
      return;
    }

    if (status === 'authenticated' && redirectAuthenticatedTo && pathname !== redirectAuthenticatedTo) {
      router.replace(redirectAuthenticatedTo);
    }
  }, [status, router, redirectTo, redirectAuthenticatedTo, pathname, requiresAuth]);

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated' && requiresAuth) {
    return null;
  }

  return <>{children}</>;
}
