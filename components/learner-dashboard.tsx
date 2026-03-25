"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { getDemoLevelFromXp, type DemoState, readDemoState } from "@/lib/demo-store";
import { BookOpen, Flame, Plus, Timer, TrendingUp } from "lucide-react";

export default function LearnerDashboard() {
  const { locale, t } = useLanguage();
  const [demoState] = useState<DemoState>(() => readDemoState());

  const deckData = demoState.decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    desc: locale === "vi" ? deck.descVi : deck.descEn,
    cards: deck.cards,
    mastered: deck.mastered,
    reviewedToday: deck.reviewedToday,
  }));

  const levelInfo = getDemoLevelFromXp(demoState.pointsLedger.total);
  const levelLabelMap = {
    beginner: locale === "vi" ? "Beginner" : "Beginner",
    learner: locale === "vi" ? "Learner" : "Learner",
    intermediate: locale === "vi" ? "Intermediate" : "Intermediate",
    advanced: locale === "vi" ? "Advanced" : "Advanced",
    master: locale === "vi" ? "Master" : "Master",
  };
  const levelLabel = levelLabelMap[levelInfo.key];
  const xpInLevel = demoState.pointsLedger.total - levelInfo.minXp;
  const levelSpan = (levelInfo.maxXp ?? levelInfo.minXp + 1) - levelInfo.minXp;
  const levelProgress = levelInfo.maxXp ? Math.round((xpInLevel / Math.max(1, levelSpan)) * 100) : 100;

  const stats = [
    {
      key: "todayCards",
      label: t("dashboard.todayCards"),
      value: demoState.studyStats.todayCards,
      icon: BookOpen,
    },
    { key: "streak", label: t("dashboard.streak"), value: demoState.studyStats.streakDays, icon: Flame },
    {
      key: "totalCards",
      label: t("dashboard.totalCards"),
      value: demoState.studyStats.totalCards,
      icon: TrendingUp,
    },
    {
      key: "pointsTotal",
      label: locale === "vi" ? "Tong diem" : "Total points",
      value: demoState.pointsLedger.total,
      icon: TrendingUp,
    },
    {
      key: "accuracy",
      label: t("dashboard.accuracy"),
      value: `${demoState.studyStats.accuracy}%`,
      icon: TrendingUp,
    },
    {
      key: "studyTime",
      label: t("dashboard.studyTime"),
      value: `${Math.round(demoState.studyStats.totalStudyMinutes / 60)}h`,
      icon: Timer,
    },
  ];

  const recentActivity = demoState.recentActivity.map((item) => {
    const title = locale === "vi" ? item.titleVi : item.titleEn;
    const pointsLabel = item.points > 0 ? `+${item.points} XP` : "0 XP";

    return `${title} (${pointsLabel})`;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/decks">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("dashboard.newDeck")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="mb-6 border-border/70 bg-card/80">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {locale === "vi" ? "Level system theo XP" : "XP level system"}
                </p>
                <h2 className="text-xl font-bold">
                  {levelLabel} · {demoState.pointsLedger.total} XP
                </h2>
                <p className="text-sm text-muted-foreground">
                  {levelInfo.maxXp
                    ? locale === "vi"
                      ? `${Math.max(0, levelInfo.maxXp - demoState.pointsLedger.total)} XP để lên level tiếp theo`
                      : `${Math.max(0, levelInfo.maxXp - demoState.pointsLedger.total)} XP to next level`
                    : locale === "vi"
                      ? "Bạn đã ở level cao nhất"
                      : "You are at the highest level"}
                </p>
              </div>
              <Link href="/study/settings">
                <Button variant="outline">SRS settings</Button>
              </Link>
            </div>
            <div className="mt-4">
              <Progress value={levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {stats.map((item) => (
            <Card key={item.key}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{item.value}</p>
                  </div>
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-4 border-border/70 bg-card/70">
              <CardContent className="flex flex-wrap gap-2 pt-6">
                <Link href="/tests">
                  <Button variant="outline" size="sm">
                    {locale === "vi" ? "Mini Test" : "Mini Test"}
                  </Button>
                </Link>
                <Link href="/reminders">
                  <Button variant="outline" size="sm">
                    {locale === "vi" ? "Nhac hoc" : "Reminders"}
                  </Button>
                </Link>
                <Link href="/study/settings">
                  <Button variant="outline" size="sm">
                    SRS settings
                  </Button>
                </Link>
                <Link href="/teacher">
                  <Button variant="outline" size="sm">
                    {locale === "vi" ? "Giao vien" : "Teacher"}
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    {locale === "vi" ? "Quan tri" : "Admin"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {t("dashboard.yourDecks")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {deckData.length} {t("dashboard.activeDecks")}
                </p>
              </div>
              <Link href="/study/session">
                <Button variant="outline">{t("dashboard.play")}</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {deckData.map((deck) => {
                const masteredProgress = (deck.mastered / deck.cards) * 100;
                return (
                  <Card key={deck.id}>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{deck.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {deck.desc}
                          </p>
                        </div>
                        <Link href="/study/session">
                          <Button size="sm" variant="outline">
                            {t("dashboard.play")}
                          </Button>
                        </Link>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {t("dashboard.mastered")}
                            </span>
                            <span>
                              {deck.mastered}/{deck.cards}
                            </span>
                          </div>
                          <Progress value={masteredProgress} className="h-2" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("dashboard.reviewedToday")}: {deck.reviewedToday}{" "}
                          {t("dashboard.cards")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {recentActivity.map((item) => (
                  <p
                    key={item}
                    className="rounded-md bg-muted p-3 text-muted-foreground"
                  >
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
