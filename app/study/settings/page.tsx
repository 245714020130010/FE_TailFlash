import type { Metadata } from "next";
import SrsSettingsPage from "@/components/srs-settings-page";

export const metadata: Metadata = {
  title: "SRS Settings | TailFlash",
  description: "Tùy chỉnh thông số học SRS cho phiên học flashcard trên TailFlash.",
};

export default function StudySettingsPage() {
  return <SrsSettingsPage />;
}
