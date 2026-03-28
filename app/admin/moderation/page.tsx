import type { Metadata } from "next";
import AdminAuthorizationWorkspace from "@/components/admin-authorization-workspace";

export const metadata: Metadata = {
  title: "Admin Moderation | TailFlash",
  description: "Màn hình kiểm duyệt yêu cầu giáo viên cho admin TailFlash.",
};

export default function AdminModerationPage() {
  return <AdminAuthorizationWorkspace initialSection="moderation" />;
}
