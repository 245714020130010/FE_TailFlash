"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api/types";
import { toast } from "sonner";

export default function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const tokenFromUrl = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordValid = useMemo(() => {
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    return newPassword.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
  }, [newPassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận chưa khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      toast.success("Đặt lại mật khẩu thành công");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể đặt lại mật khẩu");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(99,102,241,0.07),transparent_35%),radial-gradient(circle_at_75%_10%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_65%_80%,rgba(14,165,233,0.07),transparent_32%)]" />

      <div className="p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Đặt lại mật khẩu
              </p>
              <span className="text-xl font-bold text-foreground">TailFlash</span>
            </div>
          </Link>
          <Link href="/login" className="text-sm text-primary flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-12 sm:px-6 lg:flex-row lg:items-center">
        <Card className="w-full max-w-md border-border/70 bg-card/80 p-8 shadow-lg sm:p-10">
          <h1 className="mb-2 text-2xl font-bold">Tạo mật khẩu mới</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Nhập token khôi phục và mật khẩu mới. Trong demo, bạn có thể nhập token bất kỳ.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Token khôi phục
              </label>
              <Input
                id="token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="paste-reset-token"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground"
              disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </Card>

        <div className="flex-1 space-y-4 rounded-2xl border bg-background/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <KeyRound className="h-4 w-4" />
            Yêu cầu mật khẩu an toàn
          </div>
          <div className="rounded-xl border bg-card/70 p-4 text-sm text-muted-foreground">
            Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </div>
          <div className="rounded-xl border bg-card/70 p-4 text-sm text-muted-foreground">
            Sau khi đổi mật khẩu, hãy đăng nhập lại trên thiết bị cũ để bảo mật tài khoản.
          </div>
        </div>
      </div>
    </div>
  );
}
