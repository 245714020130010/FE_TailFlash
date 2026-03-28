import type { Metadata } from "next";
import AdminAuthorizationWorkspace from "@/components/admin-authorization-workspace";

export const metadata: Metadata = {
  title: "Admin Reports | TailFlash",
  description: "Màn hình báo cáo và phân quyền cho admin TailFlash.",
};

export default function AdminReportsPage() {
  return <AdminAuthorizationWorkspace initialSection="reports" />;
}
