import type { Metadata } from "next";
import LearnerDashboard from "@/components/learner-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | TailFlash",
  description:
    "Theo dõi tiến độ học, bộ từ và hoạt động gần đây trên TailFlash.",
};

export default function DashboardPage() {
  return <LearnerDashboard />;
}
