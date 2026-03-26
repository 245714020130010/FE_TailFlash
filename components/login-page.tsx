"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api/types";
import { signInWithOAuthDemo } from "@/lib/demo-store";
import { toast } from "sonner";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success("Đăng nhập thành công");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể đăng nhập");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "facebook") => {
    signInWithOAuthDemo({ provider });
    toast.success(
      provider === "google"
        ? t("auth.loginGoogleSuccess")
        : t("auth.loginFacebookSuccess"),
    );
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.07),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(14,165,233,0.07),transparent_32%)]" />

      <header className="p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Trải nghiệm học
              </p>
              <span className="text-xl font-bold">TailFlash</span>
            </div>
          </Link>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 sm:px-6 sm:pb-16 lg:flex-row">
        <Card className="w-full max-w-md border-border/70 bg-card/80 p-8 shadow-lg sm:p-10">
          <h1 className="mb-2 text-3xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {t("auth.loginSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("auth.email")}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password")}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-primary" />
                {t("auth.rememberMe")}
              </label>
              <Link href="/forgot-password" className="text-primary">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? t("auth.loginLoading") : t("auth.login")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>{t("common.or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => handleOAuthLogin("google")}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => handleOAuthLogin("facebook")}
            >
              Facebook
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="font-semibold text-primary">
              {t("auth.signupNow")}
            </Link>
          </p>
        </Card>

        <div className="flex-1 rounded-2xl border bg-background/70 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Lý do quay lại
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Giao diện tối giản, vẫn đủ SRS + mini games
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Học kiểu Flash Cards: ít nút, phím tắt rõ ràng, một quyết định
            duy nhất cho mỗi thẻ. Dashboard và game nằm trong cùng luồng.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: <PlayCircle className="h-4 w-4" />,
                title: "Ôn cực nhanh",
                desc: "Lật thẻ, chọn Quên/Khó/Tốt/Dễ bằng phím 1-4.",
              },
              {
                icon: <LayoutDashboard className="h-4 w-4" />,
                title: "Dashboard tức thì",
                desc: "Streak, accuracy, số thẻ hôm nay hiển thị ngay.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border bg-card/70 p-4"
              >
                <div className="flex items-center gap-2 text-primary">
                  {item.icon}
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-4 text-sm">
            <p className="font-semibold">Giữ nguyên cài đặt của bạn</p>
            <p className="text-muted-foreground">
              Theme, ngôn ngữ, hotkey, chế độ học không thay đổi khi bạn đăng
              nhập.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card/50 p-4 text-center text-xs text-muted-foreground">
        <p>© 2026 TailFlash. {t("auth.copyright")}</p>
      </footer>
    </div>
  );
}
