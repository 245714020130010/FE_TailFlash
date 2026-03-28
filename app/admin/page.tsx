import type { Metadata } from "next";
import AdminAuthorizationWorkspace from "@/components/admin-authorization-workspace";

export const metadata: Metadata = {
  title: "Admin Workspace | TailFlash",
  description: "Duyệt yêu cầu giáo viên và quản lý phân quyền admin của TailFlash.",
};

export default function AdminPage() {
  return <AdminAuthorizationWorkspace />;
}
