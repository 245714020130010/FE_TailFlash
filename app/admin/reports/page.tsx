import type { Metadata } from "next";
import AdminWorkspace from "@/components/admin-workspace";

export const metadata: Metadata = {
  title: "Admin Reports | TailFlash",
  description: "Man hinh bao cao noi dung chuyen biet cho admin trong demo TailFlash.",
};

export default function AdminReportsPage() {
  return <AdminWorkspace initialSection="reports" />;
}
