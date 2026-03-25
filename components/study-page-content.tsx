"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle,
  Flame,
  LayoutDashboard,
  Sparkles,
  Target,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const upcomingDecks = [
  {
    nameVi: "TOEIC 600 - Bộ 1",
    nameEn: "TOEIC 600 - Set 1",
    due: 18,
    levelVi: "Mới bắt đầu",
    levelEn: "Beginner",
  },
  {
    nameVi: "Academic Words - Set A",
    nameEn: "Academic Words - Set A",
    due: 14,
    levelVi: "Ôn tập",
    levelEn: "Review",
  },
  {
    nameVi: "Daily Conversation",
    nameEn: "Daily Conversation",
    due: 8,
    levelVi: "Duy trì",
    levelEn: "Maintenance",
  },
];

export default function StudyPageContent() {
  const { locale, t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.07),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.07),transparent_32%)]" />

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-sm">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Study board
              </p>
              <span className="text-lg font-bold">TailFlash</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <HeaderThemeToggle />
            <Link href="/decks" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                {t("common.decks")}
              </Button>
            </Link>
            <Link href="/progress" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                {t("common.progress")}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("common.account")}
              </Button>
            </Link>
            <Link href="/study/session">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {t("common.startLearning")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Focus strip */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-card/70 p-6 shadow-lg shadow-primary/5">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t("study.title")}
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              {t("study.subtitle")}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Giao diện tối giản giống flashcards.world: chọn bộ thẻ, bấm học,
              chỉ 1 quyết định cho mỗi thẻ. Games và dashboard gọn, không phân
              tán.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Card className="border-border/70 bg-background/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("study.dueToday")}
                  </span>
                </div>
                <p className="text-3xl font-bold">47</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "vi"
                    ? "Flashcards cần ôn ngay"
                    : "Flashcards ready to review"}
                </p>
              </Card>
              <Card className="border-border/70 bg-background/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-accent">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("study.streak")}
                  </span>
                </div>
                <p className="text-3xl font-bold">9</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "vi" ? "Ngày liên tiếp" : "Consecutive days"}
                </p>
              </Card>
              <Card className="border-border/70 bg-background/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-secondary">
                  <CalendarClock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("study.timeGoal")}
                  </span>
                </div>
                <p className="text-3xl font-bold">15m</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "vi"
                    ? "Phiên học đề xuất"
                    : "Recommended session"}
                </p>
              </Card>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/study/session" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-md">
                  {t("study.session")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  {t("study.saveProgress")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-background/70 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">
                Phiên sắp tới
              </p>
              <span className="text-xs text-muted-foreground">SRS + Games</span>
            </div>
            <div className="rounded-xl border bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Deck
              </p>
              <h3 className="text-lg font-semibold">TOEIC 600 - Bộ 1</h3>
              <p className="text-sm text-muted-foreground">
                12 thẻ mới · 22 thẻ ôn hôm nay
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-border">
                <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                {
                  icon: <Target className="h-4 w-4" />,
                  title: "Mục tiêu",
                  desc: "34 thẻ/phiên · 6s/thẻ",
                },
                {
                  icon: <CheckCircle className="h-4 w-4" />,
                  title: "Nhịp",
                  desc: "Quên/Khó/Tốt/Dễ",
                },
                {
                  icon: <LayoutDashboard className="h-4 w-4" />,
                  title: "Dashboard",
                  desc: "Hiển thị ngay streak, accuracy",
                },
                {
                  icon: <ArrowRight className="h-4 w-4" />,
                  title: "Hotkey",
                  desc: "1-4 để chọn mức nhớ",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border bg-card/70 p-3"
                >
                  <div className="flex items-center gap-2 text-primary">
                    {item.icon}
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/study/session" className="inline-flex">
              <Button variant="ghost" className="gap-2 text-primary">
                Bắt đầu ngay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick links & decks */}
        <section className="space-y-5">
          <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-primary">
              {t("study.quickLinks")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/onboarding">
                <Button variant="outline" size="sm">
                  Onboarding
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("common.dashboard")}
                </Button>
              </Link>
              <Link href="/games">
                <Button variant="outline" size="sm">
                  {t("common.games")}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t("study.recommendedDecks")}
            </h2>
            <span className="text-sm text-muted-foreground">SRS ưu tiên</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {upcomingDecks.map((deck) => (
              <Card
                key={deck.nameEn}
                className="border-border/70 bg-card/70 p-5 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  {locale === "vi" ? deck.levelVi : deck.levelEn}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {locale === "vi" ? deck.nameVi : deck.nameEn}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {deck.due} {t("study.dueWords")}
                </p>
                <Progress
                  value={Math.min(100, deck.due * 3)}
                  className="mt-4 h-2"
                />
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>SRS · spaced</span>
                  <span>Hotkey 1-4</span>
                </div>
                <Link href="/study/session" className="mt-4 inline-flex">
                  <Button size="sm" variant="outline">
                    {t("study.reviewNow")}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
