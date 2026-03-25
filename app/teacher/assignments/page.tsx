import type { Metadata } from "next";
import TeacherWorkspace from "@/components/teacher-workspace";

export const metadata: Metadata = {
  title: "Teacher Assignments | TailFlash",
  description: "Quan ly giao bai va tien do nop bai cho giao vien trong demo TailFlash.",
};

export default function TeacherAssignmentsPage() {
  return <TeacherWorkspace initialSection="assignments" />;
}
