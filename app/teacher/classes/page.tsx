import type { Metadata } from "next";
import TeacherWorkspace from "@/components/teacher-workspace";

export const metadata: Metadata = {
  title: "Teacher Classes | TailFlash",
  description: "Quan ly lop hoc chuyen biet cho giao vien trong demo TailFlash.",
};

export default function TeacherClassesPage() {
  return <TeacherWorkspace initialSection="classes" />;
}
