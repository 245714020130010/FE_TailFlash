import type { Metadata } from "next";
import OnboardingPageContent from "@/components/onboarding-page-content";

export const metadata: Metadata = {
  title: "Onboarding | TailFlash",
  description:
    "Thiết lập mục tiêu học tập ban đầu trước khi bắt đầu với TailFlash.",
};

export default function OnboardingPage() {
  return <OnboardingPageContent />;
}
