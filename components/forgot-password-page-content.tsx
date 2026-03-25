"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPageContent() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Đã gửi link khôi phục trong chế độ demo");
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
                Khôi phục mật khẩu
              </p>
              <span className="text-xl font-bold text-foreground">TailFlash</span>
            </div>
          </Link>
          <Link
            href="/login"
            className="text-sm text-primary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-12 sm:px-6 lg:flex-row lg:items-center">
        <Card className="w-full max-w-md border-border/70 bg-card/80 p-8 shadow-lg sm:p-10">
          <h1 className="mb-2 text-2xl font-bold">Khôi phục mật khẩu</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Nhập email bạn dùng để đăng ký. Chúng tôi sẽ gửi liên kết đặt lại
            mật khẩu trong vài giây.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi link khôi phục"}
            </Button>
          </form>

          {isSubmitted && (
            <p className="mt-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
              Đã gửi email demo đến {email}. Vui lòng kiểm tra hộp thư.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Đã nhớ mật khẩu?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Quay lại đăng nhập
            </Link>
          </p>
        </Card>

        <div className="flex-1 space-y-4 rounded-2xl border bg-background/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <MailCheck className="h-4 w-4" />
            Những bước tiếp theo
          </div>
          <div className="rounded-xl border bg-card/70 p-4 text-sm">
            <p className="font-semibold">1) Kiểm tra email</p>
            <p className="text-muted-foreground">
              Nếu không thấy, hãy kiểm tra mục Spam hoặc thử lại sau 30s.
            </p>
          </div>
          <div className="rounded-xl border bg-card/70 p-4 text-sm">
            <p className="font-semibold">2) Nhập mật khẩu mới</p>
            <p className="text-muted-foreground">
              Trong demo, thông báo thành công được hiển thị ngay trên giao diện.
            </p>
          </div>
          <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Bảo vệ tài khoản
            </div>
            <p className="text-muted-foreground">
              Sau khi đặt lại, đăng xuất trên các thiết bị cũ để giữ an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
