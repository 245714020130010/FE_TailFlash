import type { Metadata } from "next";
import AdminWorkspace from "@/components/admin-workspace";

export const metadata: Metadata = {
  title: "Admin Moderation | TailFlash",
  description: "Man hinh kiem duyet chuyen biet cho admin trong demo TailFlash.",
};

export default function AdminModerationPage() {
  return <AdminWorkspace initialSection="moderation" />;
}
