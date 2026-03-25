"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";

export default function StreakCalendar() {
  const { locale, t } = useLanguage();
  const [monthOffset, setMonthOffset] = useState(0);

  const monthLabel = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
      month: "long",
      year: "numeric",
    });
  }, [locale, monthOffset]);

  const stats = [
    { key: "currentStreak", value: "15" },
    { key: "bestStreak", value: "28" },
    { key: "daysStudied", value: "22" },
    { key: "avgAccuracy", value: "87%" },
  ];

  const weekdayLabels =
    locale === "vi"
      ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const achievements =
    locale === "vi"
      ? [
          { title: "Streak 7 ngày", unlocked: true },
          { title: "Streak 14 ngày", unlocked: true },
          { title: "Huyền thoại 30 ngày", unlocked: false },
        ]
      : [
          { title: "7-day streak", unlocked: true },
          { title: "14-day streak", unlocked: true },
          { title: "30-day legend", unlocked: false },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("progress.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("progress.subtitle")}
            </p>
          </div>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.key}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t(`progress.${item.key}`)}
                </p>
                <p className="mt-2 text-3xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs defaultValue="calendar">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">{t("progress.calendar")}</TabsTrigger>
            <TabsTrigger value="analytics">
              {t("progress.analytics")}
            </TabsTrigger>
            <TabsTrigger value="achievements">
              {t("progress.achievements")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.studyCalendar")}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMonthOffset((m) => m - 1)}
                    >
                      {"<"}
                    </Button>
                    <div className="min-w-40 text-center text-sm">
                      {monthLabel}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMonthOffset((m) => m + 1)}
                    >
                      {">"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                  {weekdayLabels.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, idx) => {
                    const active = idx % 3 !== 0;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-md text-center text-xs leading-9 ${active ? "bg-primary/20" : "bg-muted"}`}
                      >
                        {idx + 1 <= 31 ? idx + 1 : ""}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>{t("progress.weeklyBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[15, 20, 12, 26, 29, 18, 10].map((value, idx) => (
                  <div key={idx}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{weekdayLabels[idx]}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded bg-muted">
                      <div
                        className={`h-2 rounded bg-primary ${
                          value >= 28
                            ? "w-[96%]"
                            : value >= 24
                              ? "w-[85%]"
                              : value >= 20
                                ? "w-[70%]"
                                : value >= 16
                                  ? "w-[55%]"
                                  : value >= 12
                                    ? "w-[40%]"
                                    : "w-[30%]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>{t("progress.achievements")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-md border p-4 ${item.unlocked ? "border-primary/40 bg-primary/5" : "opacity-60"}`}
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.unlocked
                        ? t("progress.unlocked")
                        : t("progress.locked")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
