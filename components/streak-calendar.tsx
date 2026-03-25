"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { readDemoState } from "@/lib/demo-store";

export default function StreakCalendar() {
  const { locale, t } = useLanguage();
  const [monthOffset, setMonthOffset] = useState(0);
  const [demoState] = useState(() => readDemoState());

  const monthLabel = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
      month: "long",
      year: "numeric",
    });
  }, [locale, monthOffset]);

  const monthDate = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const monthDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [monthDate]);

  const monthFirstWeekday = useMemo(() => {
    return monthDate.getDay();
  }, [monthDate]);

  const studiedDates = useMemo(() => {
    return new Set(demoState.studyHistory.map((item) => item.date));
  }, [demoState.studyHistory]);

  const activeCalendarDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    return new Set(
      demoState.studyHistory
        .filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        })
        .map((item) => new Date(item.date).getDate()),
    );
  }, [demoState.studyHistory, monthDate]);

  const stats = useMemo(() => {
    const daysStudied = studiedDates.size;

    return [
      { key: "currentStreak", value: String(demoState.studyStats.streakDays) },
      {
        key: "bestStreak",
        value: String(Math.max(demoState.studyStats.streakDays, Math.min(30, daysStudied))),
      },
      { key: "daysStudied", value: String(daysStudied) },
      { key: "avgAccuracy", value: `${demoState.studyStats.accuracy}%` },
    ];
  }, [demoState.studyStats.accuracy, demoState.studyStats.streakDays, studiedDates.size]);

  const analytics = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }).map((_, offset) => {
      const date = new Date(today);
      const daysAgo = 6 - offset;
      date.setDate(today.getDate() - daysAgo);
      const key = date.toISOString().slice(0, 10);
      const history = demoState.studyHistory.find((item) => item.date === key);
      return history?.cards ?? 0;
    });
  }, [demoState.studyHistory]);

  const weekdayLabels =
    locale === "vi"
      ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const achievements = useMemo(
    () =>
      locale === "vi"
        ? [
            { title: "Streak 7 ngay", unlocked: demoState.studyStats.streakDays >= 7 },
            { title: "Streak 14 ngay", unlocked: demoState.studyStats.streakDays >= 14 },
            {
              title: "Huyen thoai 30 ngay",
              unlocked: demoState.studyStats.streakDays >= 30,
            },
          ]
        : [
            { title: "7-day streak", unlocked: demoState.studyStats.streakDays >= 7 },
            { title: "14-day streak", unlocked: demoState.studyStats.streakDays >= 14 },
            { title: "30-day legend", unlocked: demoState.studyStats.streakDays >= 30 },
          ],
    [demoState.studyStats.streakDays, locale],
  );

  const getWeeklyBarWidthClass = (value: number) => {
    if (value >= 25) {
      return "w-full";
    }

    if (value >= 20) {
      return "w-4/5";
    }

    if (value >= 15) {
      return "w-3/5";
    }

    if (value >= 10) {
      return "w-2/5";
    }

    if (value >= 5) {
      return "w-1/5";
    }

    return "w-0";
  };

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
                  {Array.from({ length: monthFirstWeekday }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square rounded-md bg-transparent" />
                  ))}
                  {Array.from({ length: monthDays }).map((_, idx) => {
                    const day = idx + 1;
                    const active = activeCalendarDays.has(day);
                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-md text-center text-xs leading-9 ${active ? "bg-primary/20" : "bg-muted"}`}
                      >
                        {day}
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
                {analytics.map((value, idx) => (
                  <div key={idx}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{weekdayLabels[idx]}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded bg-muted">
                      <div
                        className={`h-2 rounded bg-primary ${getWeeklyBarWidthClass(value)}`}
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
