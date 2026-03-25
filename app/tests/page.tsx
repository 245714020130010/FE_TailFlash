import type { Metadata } from "next";
import MiniTestPage from "@/components/mini-test-page";

export const metadata: Metadata = {
  title: "Mini Test | TailFlash",
  description: "Bai kiem tra nhanh theo bo flashcard trong che do demo TailFlash.",
};

export default function TestsPage() {
  return <MiniTestPage />;
}
