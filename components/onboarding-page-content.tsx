"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { Brain, CheckCircle2, Gamepad2, Sparkles, Target } from "lucide-react";

export default function OnboardingPageContent() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Target,
      title: t("onboarding.stepGoal"),
      desc: t("onboarding.stepGoalDesc"),
    },
    {
      icon: Brain,
      title: t("onboarding.stepPace"),
      desc: t("onboarding.stepPaceDesc"),
    },
    {
      icon: Gamepad2,
      title: t("onboarding.stepGame"),
      desc: t("onboarding.stepGameDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-semibold">
          TailFlash
        </Link>
        <HeaderThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("onboarding.badge")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("onboarding.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("onboarding.subtitle")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="p-5">
              <step.icon className="mb-3 h-6 w-6 text-primary" />
              <h2 className="mb-2 text-lg font-semibold">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <h3 className="mb-4 text-xl font-semibold">
            {t("onboarding.checklist")}
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
              {t("onboarding.check1")}
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
              {t("onboarding.check2")}
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
              {t("onboarding.check3")}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/decks" className="w-full sm:w-auto">
              <Button className="w-full bg-primary hover:bg-primary/90">
                {t("onboarding.pickDeck")}
              </Button>
            </Link>
            <Link href="/study/session" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                {t("onboarding.skip")}
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
