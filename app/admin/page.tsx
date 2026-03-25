import type { Metadata } from "next";
import AdminWorkspace from "@/components/admin-workspace";

export const metadata: Metadata = {
  title: "Admin Workspace | TailFlash",
  description: "Duyet yeu cau giao vien va kiem duyet noi dung trong demo TailFlash.",
};

export default function AdminPage() {
  return <AdminWorkspace />;
}
