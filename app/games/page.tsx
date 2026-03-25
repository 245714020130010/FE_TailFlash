import type { Metadata } from "next";
import MiniGames from "@/components/mini-games";

export const metadata: Metadata = {
  title: "Mini Games | TailFlash",
  description:
    "Học từ vựng qua game tương tác: matching, multiple choice và typing.",
};

export default function GamesPage() {
  return <MiniGames />;
}
