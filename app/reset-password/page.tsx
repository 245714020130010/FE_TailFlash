import type { Metadata } from "next";
import ResetPasswordPageContent from "@/components/reset-password-page-content";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | TailFlash",
  description: "Đặt lại mật khẩu tài khoản TailFlash bằng token khôi phục.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />;
}
