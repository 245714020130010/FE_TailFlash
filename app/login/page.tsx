import type { Metadata } from "next";
import LoginPage from "@/components/login-page";

export const metadata: Metadata = {
  title: "Đăng nhập | TailFlash",
  description:
    "Đăng nhập vào TailFlash để tiếp tục học tiếng Anh với flashcards.",
};

export default function LoginRoutePage() {
  return <LoginPage />;
}
