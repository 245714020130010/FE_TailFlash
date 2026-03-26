"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { getDemoLevelFromXp, readDemoState } from "@/lib/demo-store";

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
      {
        key: "currentStreak",
        label: t("progress.currentStreak"),
        value: String(demoState.studyStats.streakDays),
      },
      {
        key: "bestStreak",
        label: t("progress.bestStreak"),
        value: String(Math.max(demoState.studyStats.streakDays, Math.min(30, daysStudied))),
      },
      { key: "daysStudied", label: t("progress.daysStudied"), value: String(daysStudied) },
      { key: "avgAccuracy", label: t("progress.avgAccuracy"), value: `${demoState.studyStats.accuracy}%` },
      {
        key: "totalPoints",
        label: locale === "vi" ? "Tong diem" : "Total points",
        value: String(demoState.pointsLedger.total),
      },
    ];
  }, [
    demoState.pointsLedger.total,
    demoState.studyStats.accuracy,
    demoState.studyStats.streakDays,
    locale,
    studiedDates.size,
    t,
  ]);

  const pointsBreakdown = useMemo(() => {
    const total = Math.max(1, demoState.pointsLedger.total);

    return [
      {
        key: "study",
        label: locale === "vi" ? "SRS study" : "SRS study",
        value: demoState.pointsLedger.study,
        percent: Math.round((demoState.pointsLedger.study / total) * 100),
      },
      {
        key: "miniTest",
        label: locale === "vi" ? "Mini test" : "Mini test",
        value: demoState.pointsLedger.miniTest,
        percent: Math.round((demoState.pointsLedger.miniTest / total) * 100),
      },
      {
        key: "game",
        label: locale === "vi" ? "Mini games" : "Mini games",
        value: demoState.pointsLedger.game,
        percent: Math.round((demoState.pointsLedger.game / total) * 100),
      },
    ];
  }, [demoState.pointsLedger.game, demoState.pointsLedger.miniTest, demoState.pointsLedger.study, demoState.pointsLedger.total, locale]);

  const gameModeBreakdown = useMemo(() => {
    const counters = {
      matching: 0,
      multiple: 0,
      typing: 0,
      builder: 0,
      memoryFlip: 0,
      sprint: 0,
      listening: 0,
    };

    demoState.recentActivity.forEach((item) => {
      if (item.type === "game" && item.gameType) {
        counters[item.gameType] += 1;
      }
    });

    const labels = {
      matching: locale === "vi" ? "Matching" : "Matching",
      multiple: locale === "vi" ? "Multiple Choice" : "Multiple Choice",
      typing: locale === "vi" ? "Typing" : "Typing",
      builder: locale === "vi" ? "Word Builder" : "Word Builder",
      memoryFlip: locale === "vi" ? "Memory Flip" : "Memory Flip",
      sprint: locale === "vi" ? "Sprint" : "Sprint",
      listening: locale === "vi" ? "Listening" : "Listening",
    };

    return Object.entries(counters)
      .map(([key, value]) => ({
        key,
        label: labels[key as keyof typeof labels],
        value,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [demoState.recentActivity, locale]);

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

  const xpByDay = useMemo(() => {
    const today = new Date();
    const byDate = new Map<string, number>();

    demoState.xpHistory.forEach((item) => {
      byDate.set(item.date, (byDate.get(item.date) ?? 0) + item.xp);
    });

    return Array.from({ length: 7 }).map((_, offset) => {
      const date = new Date(today);
      const daysAgo = 6 - offset;
      date.setDate(today.getDate() - daysAgo);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
          day: "2-digit",
          month: "2-digit",
        }),
        xp: byDate.get(key) ?? 0,
      };
    });
  }, [demoState.xpHistory, locale]);

  const xpForecast = useMemo(() => {
    const totalXp = demoState.pointsLedger.total;
    const levelInfo = getDemoLevelFromXp(totalXp);
    const maxDailyXp = Math.max(1, ...xpByDay.map((item) => item.xp));
    const avgDailyXp = xpByDay.reduce((sum, item) => sum + item.xp, 0) / xpByDay.length;

    if (levelInfo.maxXp === null) {
      return {
        levelInfo,
        maxDailyXp,
        avgDailyXp,
        daysToNextLevel: null,
        predictedDate: null,
        remainingXp: 0,
      };
    }

    const remainingXp = Math.max(0, levelInfo.maxXp - totalXp);
    const effectiveDailyXp = Math.max(1, avgDailyXp);
    const daysToNextLevel = Math.ceil(remainingXp / effectiveDailyXp);
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysToNextLevel);

    return {
      levelInfo,
      maxDailyXp,
      avgDailyXp,
      daysToNextLevel,
      predictedDate,
      remainingXp,
    };
  }, [demoState.pointsLedger.total, xpByDay]);

  const levelLabels = {
    beginner: locale === "vi" ? "Người mới" : "Beginner",
    learner: locale === "vi" ? "Người học" : "Learner",
    intermediate: locale === "vi" ? "Trung cấp" : "Intermediate",
    advanced: locale === "vi" ? "Nâng cao" : "Advanced",
    master: locale === "vi" ? "Bậc thầy" : "Master",
  } as const;

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

  const getPointsBarWidthClass = (percent: number) => {
    if (percent >= 100) {
      return "w-full";
    }

    if (percent >= 80) {
      return "w-4/5";
    }

    if (percent >= 60) {
      return "w-3/5";
    }

    if (percent >= 40) {
      return "w-2/5";
    }

    if (percent >= 20) {
      return "w-1/5";
    }

    if (percent > 0) {
      return "w-[8%]";
    }

    return "w-0";
  };

  const getXpBarHeightClass = (percent: number) => {
    if (percent >= 100) {
      return "h-full";
    }

    if (percent >= 85) {
      return "h-5/6";
    }

    if (percent >= 70) {
      return "h-4/5";
    }

    if (percent >= 50) {
      return "h-3/5";
    }

    if (percent >= 30) {
      return "h-2/5";
    }

    if (percent >= 15) {
      return "h-1/5";
    }

    if (percent > 0) {
      return "h-[10%]";
    }

    return "h-0";
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
        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {stats.map((item) => (
            <Card key={item.key}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.label}
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
            <Card className="mb-4">
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

            <Card>
              <CardHeader>
                <CardTitle>{locale === "vi" ? "Nguon diem tich luy" : "Points contribution"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pointsBreakdown.map((item) => (
                  <div key={item.key}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{item.label}</span>
                      <span>{item.value} ({item.percent}%)</span>
                    </div>
                    <div className="h-2 rounded bg-muted">
                      <div className={`h-2 rounded bg-primary ${getPointsBarWidthClass(item.percent)}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{locale === "vi" ? "Chi tiet mini game" : "Mini game details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameModeBreakdown.length > 0 ? (
                  gameModeBreakdown.map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {locale === "vi" ? "Chưa có dữ liệu mini game" : "No mini game data yet"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{locale === "vi" ? "XP 7 ngày gần đây" : "Daily XP (last 7 days)"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid h-40 grid-cols-7 items-end gap-2">
                  {xpByDay.map((item) => {
                    const heightPercent = Math.round((item.xp / xpForecast.maxDailyXp) * 100);

                    return (
                      <div key={item.key} className="flex flex-col items-center gap-2">
                        <div className="w-full rounded-md bg-muted p-1 text-center text-[10px] text-muted-foreground">
                          {item.xp}
                        </div>
                        <div className="flex h-24 w-full items-end rounded-md bg-muted/50 p-1">
                          <div
                            className={`w-full rounded-sm bg-primary ${getXpBarHeightClass(Math.max(6, heightPercent))}`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <p>
                    {locale === "vi" ? "Level hiện tại" : "Current level"}: {levelLabels[xpForecast.levelInfo.key]}
                  </p>
                  <p>
                    {locale === "vi" ? "XP trung bình/ngày" : "Average XP/day"}: {xpForecast.avgDailyXp.toFixed(1)}
                  </p>
                  {xpForecast.daysToNextLevel === null ? (
                    <p>{locale === "vi" ? "Bạn đã đạt level cao nhất" : "You reached the highest level"}</p>
                  ) : (
                    <>
                      <p>
                        {locale === "vi" ? "XP còn thiếu" : "XP remaining"}: {xpForecast.remainingXp}
                      </p>
                      <p>
                        {locale === "vi" ? "Dự đoán lên level tiếp theo" : "Predicted next level date"}: {xpForecast.predictedDate?.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                      </p>
                    </>
                  )}
                </div>
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
