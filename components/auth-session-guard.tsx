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
  const { isAuthReady, isAuthenticated, currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (isPublicPath || !isProtectedPath) {
      return;
    }

    if (!isAuthenticated) {
      const redirectTarget = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirectTarget}`);
      return;
    }

    if (pathname.startsWith("/admin") && currentUser && currentUser.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (pathname.startsWith("/teacher") && currentUser && !["TEACHER", "ADMIN"].includes(currentUser.role)) {
      router.replace("/dashboard");
      return;
    }
  }, [currentUser, isAuthReady, isAuthenticated, pathname, router]);

  return null;
}
