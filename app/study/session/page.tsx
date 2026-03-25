import type { Metadata } from "next";
import FlashcardStudyPage from "@/components/flashcard-study-page";

export const metadata: Metadata = {
  title: "Phiên học | TailFlash",
  description: "Ôn tập từ vựng với flashcard và SRS trong TailFlash.",
};

export default function StudySessionPage() {
  return <FlashcardStudyPage />;
}
