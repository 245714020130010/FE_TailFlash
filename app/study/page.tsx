import type { Metadata } from "next";
import StudyPageContent from "@/components/study-page-content";

export const metadata: Metadata = {
  title: "Study | TailFlash",
  description: "Trang học tập chính để bắt đầu phiên flashcard của TailFlash.",
};

export default function StudyPage() {
  return <StudyPageContent />;
}
