"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
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
import { signInWithOAuthDemo, updateDemoState } from "@/lib/demo-store";
import { toast } from "sonner";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"learner" | "teacher">("learner");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    }),
    [password]
  );

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    updateDemoState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        fullName,
        email,
        role,
      },
      session: {
        isLoggedIn: true,
        email,
        provider: "password",
      },
    }));
    setIsLoading(false);
    toast.success("Tạo tài khoản demo thành công");
    router.push("/onboarding");
  };

  const handleOAuthSignup = (provider: "google" | "facebook") => {
    signInWithOAuthDemo({ provider, role });
    toast.success(
      provider === "google"
        ? t("auth.signupGoogleSuccess")
        : t("auth.signupFacebookSuccess"),
    );
    router.push("/onboarding");
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
                Tạo tài khoản
              </p>
              <span className="text-xl font-bold">TailFlash</span>
            </div>
          </Link>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 sm:px-6 sm:pb-16 lg:flex-row">
        <Card className="w-full max-w-md border-border/70 bg-card/80 p-8 shadow-lg sm:p-10">
          <h1 className="mb-2 text-3xl font-bold">{t("auth.signupTitle")}</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {t("auth.signupSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                {t("auth.fullName")}
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Nguyen"
                required
              />
            </div>

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
                  placeholder={t("auth.minLength")}
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

              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  {[
                    { ok: passwordChecks.minLength, label: "8+ chars" },
                    { ok: passwordChecks.hasUpper, label: "Uppercase" },
                    { ok: passwordChecks.hasLower, label: "Lowercase" },
                    { ok: passwordChecks.hasNumber, label: "Number" },
                  ].map((rule) => (
                    <p
                      key={rule.label}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1 ${
                        rule.ok
                          ? "border-primary/60 bg-primary/5 text-primary"
                          : "border-border"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      {rule.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("auth.roleTitle")}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[{ value: "learner", label: t("auth.learner") }, { value: "teacher", label: t("auth.teacher") }].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value as "learner" | "teacher")}
                    className={`rounded-md border px-3 py-2 text-left transition hover:border-primary ${
                      role === item.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                {t("auth.termsPrefix")} {" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {t("auth.terms")}
                </Link>{" "}
                & {" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t("auth.privacy")}
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground"
              disabled={!agreeTerms || !isPasswordValid || isLoading}
            >
              {isLoading ? t("auth.signupLoading") : t("auth.signup")}
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
              onClick={() => handleOAuthSignup("google")}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => handleOAuthSignup("facebook")}
            >
              Facebook
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")} {" "}
            <Link href="/login" className="font-semibold text-primary">
              {t("auth.login")}
            </Link>
          </p>
        </Card>

        <div className="flex-1 rounded-2xl border bg-background/70 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Lý do đăng ký
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Đồng bộ SRS, giữ hotkey, mở dashboard mini games
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Giữ trải nghiệm Flash Cards nhưng thêm streak, biểu đồ và trò chơi. Mọi cài đặt cá nhân của bạn vẫn được giữ nguyên sau khi đăng ký.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[{ icon: <PlayCircle className="h-4 w-4" />, title: "Ôn nhanh + hotkey", desc: "Lật, chọn mức nhớ, nghe phát âm tức thì." }, { icon: <LayoutDashboard className="h-4 w-4" />, title: "Dashboard gọn", desc: "Streak, accuracy, heatmap được đồng bộ." }].map((item) => (
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
            <p className="font-semibold">Giữ cài đặt hiện có</p>
            <p className="text-muted-foreground">
              Theme, ngôn ngữ, chế độ học và hotkey vẫn y nguyên sau khi bạn tạo tài khoản.
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
