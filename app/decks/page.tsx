import type { Metadata } from "next";
import DecksPageContent from "@/components/decks-page-content";

export const metadata: Metadata = {
  title: "Decks | TailFlash",
  description: "Quản lý, tìm kiếm và bắt đầu học các bộ flashcard TailFlash.",
};

export default function DecksPage() {
  return <DecksPageContent />;
}
