"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { BookOpen, Flame, Plus, Timer, TrendingUp } from "lucide-react";

export default function LearnerDashboard() {
  const { locale, t } = useLanguage();

  const deckData =
    locale === "vi"
      ? [
          {
            id: "1",
            name: "TOEIC Core",
            desc: "Từ vựng cốt lõi cho TOEIC",
            cards: 120,
            mastered: 64,
            reviewedToday: 16,
          },
          {
            id: "2",
            name: "Business English",
            desc: "Từ vựng công sở thực tế",
            cards: 80,
            mastered: 27,
            reviewedToday: 7,
          },
          {
            id: "3",
            name: "Daily Conversation",
            desc: "Mẫu câu giao tiếp hằng ngày",
            cards: 60,
            mastered: 35,
            reviewedToday: 4,
          },
        ]
      : [
          {
            id: "1",
            name: "TOEIC Core",
            desc: "Core vocabulary for TOEIC",
            cards: 120,
            mastered: 64,
            reviewedToday: 16,
          },
          {
            id: "2",
            name: "Business English",
            desc: "Practical office vocabulary",
            cards: 80,
            mastered: 27,
            reviewedToday: 7,
          },
          {
            id: "3",
            name: "Daily Conversation",
            desc: "Everyday conversation patterns",
            cards: 60,
            mastered: 35,
            reviewedToday: 4,
          },
        ];

  const totalCards = deckData.reduce((sum, deck) => sum + deck.cards, 0);
  const cardsReviewedToday = deckData.reduce(
    (sum, deck) => sum + deck.reviewedToday,
    0,
  );

  const stats = [
    { key: "todayCards", value: cardsReviewedToday, icon: BookOpen },
    { key: "streak", value: 15, icon: Flame },
    { key: "totalCards", value: totalCards, icon: TrendingUp },
    { key: "accuracy", value: "89%", icon: TrendingUp },
    { key: "studyTime", value: "128h", icon: Timer },
  ];

  const recentActivity =
    locale === "vi"
      ? [
          "Hoàn thành 16 thẻ trong TOEIC Core",
          "Đạt streak 15 ngày liên tiếp",
          "Ôn 7 thẻ Business English",
        ]
      : [
          "Completed 16 cards in TOEIC Core",
          "Reached a 15-day streak",
          "Reviewed 7 Business English cards",
        ];

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
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((item) => (
            <Card key={item.key}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t(`dashboard.${item.key}`)}
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
