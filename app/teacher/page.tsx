import type { Metadata } from "next";
import TeacherWorkspace from "@/components/teacher-workspace";

export const metadata: Metadata = {
  title: "Teacher Workspace | TailFlash",
  description: "Quan ly lop hoc, bai tap va quy trinh duyet giao vien o che do demo.",
};

export default function TeacherPage() {
  return <TeacherWorkspace />;
}
