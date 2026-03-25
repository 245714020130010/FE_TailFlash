import type { Metadata } from "next";
import SignupPage from "@/components/signup-page";

export const metadata: Metadata = {
  title: "Đăng ký | TailFlash",
  description: "Tạo tài khoản TailFlash để bắt đầu học từ vựng bằng SRS.",
};

export default function SignupRoutePage() {
  return <SignupPage />;
}
