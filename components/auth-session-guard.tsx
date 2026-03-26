"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/decks",
  "/study",
  "/profile",
  "/progress",
  "/reminders",
  "/games",
  "/teacher",
  "/admin",
  "/tests",
];

export default function AuthSessionGuard() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (isPublicPath || !isProtectedPath || isAuthenticated) {
      return;
    }

    const redirectTarget = encodeURIComponent(pathname);
    router.replace(`/login?redirect=${redirectTarget}`);
  }, [isAuthenticated, pathname, router]);

  return null;
}
