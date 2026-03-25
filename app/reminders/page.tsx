import type { Metadata } from "next";
import RemindersPageContent from "@/components/reminders-page-content";

export const metadata: Metadata = {
  title: "Reminder Center | TailFlash",
  description: "Cai dat lich nhac hoc va thong bao tien do trong demo TailFlash.",
};

export default function RemindersPage() {
  return <RemindersPageContent />;
}
