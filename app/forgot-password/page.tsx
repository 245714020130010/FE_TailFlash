import type { Metadata } from "next";
import ForgotPasswordPageContent from "@/components/forgot-password-page-content";

export const metadata: Metadata = {
  title: "Quên mật khẩu | TailFlash",
  description: "Khôi phục mật khẩu tài khoản TailFlash qua email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
