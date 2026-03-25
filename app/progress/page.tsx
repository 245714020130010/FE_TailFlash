import type { Metadata } from "next";
import StreakCalendar from "@/components/streak-calendar";

export const metadata: Metadata = {
  title: "Tiến độ học | TailFlash",
  description: "Theo dõi streak và thống kê học tập theo ngày trên TailFlash.",
};

export default function ProgressPage() {
  return <StreakCalendar />;
}
