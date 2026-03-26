"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/language-provider";
import {
  createDefaultDemoState,
  readDemoState,
  saveReminderSettings,
  updateNotificationSettings,
} from "@/lib/demo-store";

const reminderSchema = z.object({
  time: z.string().min(4),
  timezone: z.string().min(3),
  dailyReminder: z.boolean(),
  weeklyReport: z.boolean(),
  streakWarning: z.boolean(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
});

type ReminderFormInput = z.infer<typeof reminderSchema>;

export default function RemindersPageContent() {
  const { locale } = useLanguage();
  const defaultDemoState = useMemo(() => createDefaultDemoState(), []);
  const [demoState, setDemoState] = useState(defaultDemoState);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const form = useForm<ReminderFormInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      time: demoState.reminder.time,
      timezone: demoState.reminder.timezone,
      dailyReminder: demoState.notifications.dailyReminder,
      weeklyReport: demoState.notifications.weeklyReport,
      streakWarning: demoState.notifications.streakWarning,
      daysOfWeek: demoState.reminder.daysOfWeek,
    },
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hydrated = readDemoState();
      setDemoState(hydrated);
      form.reset({
        time: hydrated.reminder.time,
        timezone: hydrated.reminder.timezone,
        dailyReminder: hydrated.notifications.dailyReminder,
        weeklyReport: hydrated.notifications.weeklyReport,
        streakWarning: hydrated.notifications.streakWarning,
        daysOfWeek: hydrated.reminder.daysOfWeek,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [form]);

  const timezoneOptions = useMemo(
    () => [
      "Asia/Ho_Chi_Minh",
      "Asia/Tokyo",
      "Europe/London",
      "America/New_York",
      "Australia/Sydney",
    ],
    [],
  );

  const weekdayLabels = useMemo(
    () =>
      locale === "vi"
        ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [locale],
  );

  const onSubmit = (values: ReminderFormInput) => {
    const withNotificationState = updateNotificationSettings({
      dailyReminder: values.dailyReminder,
      weeklyReport: values.weeklyReport,
      streakWarning: values.streakWarning,
    });

    const nextState = saveReminderSettings({
      time: values.time,
      timezone: values.timezone,
      daysOfWeek: values.daysOfWeek,
      enabled: values.dailyReminder,
    });

    setDemoState({
      ...withNotificationState,
      ...nextState,
    });

    toast.success(locale === "vi" ? "Đã cập nhật lịch nhắc học demo" : "Demo reminder schedule updated");
  };

  const selectedDays = useWatch({
    control: form.control,
    name: "daysOfWeek",
  });

  const dailyReminderEnabled = useWatch({
    control: form.control,
    name: "dailyReminder",
  });

  const weeklyReportEnabled = useWatch({
    control: form.control,
    name: "weeklyReport",
  });

  const streakWarningEnabled = useWatch({
    control: form.control,
    name: "streakWarning",
  });

  const timezone = useWatch({
    control: form.control,
    name: "timezone",
  });

  const nextReminderLabel = useMemo(() => {
    if (!isHydrated) {
      return "--";
    }

    try {
      return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: demoState.reminder.timezone,
      }).format(new Date(demoState.reminder.nextReminderAt));
    } catch {
      return new Date(demoState.reminder.nextReminderAt).toLocaleString(
        locale === "vi" ? "vi-VN" : "en-US",
      );
    }
  }, [demoState.reminder.nextReminderAt, demoState.reminder.timezone, isHydrated, locale]);

  const notificationPreview = useMemo(
    () => [
      {
        id: "review",
        textVi: `🔔 Bạn có ${Math.max(1, demoState.decks.reduce((sum, deck) => sum + deck.dueToday, 0))} thẻ cần ôn hôm nay!`,
        textEn: `🔔 You have ${Math.max(1, demoState.decks.reduce((sum, deck) => sum + deck.dueToday, 0))} cards due today!`,
      },
      {
        id: "streak",
        textVi: `🔥 Đừng để mất streak ${demoState.studyStats.streakDays} ngày!`,
        textEn: `🔥 Keep your ${demoState.studyStats.streakDays}-day streak alive!`,
      },
      {
        id: "progress",
        textVi: `🏆 Bạn đã tích lũy ${demoState.gameStats.pointsEarned} điểm trong demo.`,
        textEn: `🏆 You have earned ${demoState.gameStats.pointsEarned} points in demo mode.`,
      },
    ],
    [demoState.decks, demoState.gameStats.pointsEarned, demoState.studyStats.streakDays],
  );

  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day].sort((a, b) => a - b);

    form.setValue("daysOfWeek", next, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">
              {locale === "vi" ? "Reminder Center" : "Reminder Center"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {locale === "vi"
                ? "Quản lý nhắc học và thông báo tiến độ"
                : "Manage study reminders and progress notifications"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/study">
              <Button variant="outline">{locale === "vi" ? "Quay lại" : "Back"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "vi" ? "Cài đặt nhắc học" : "Reminder settings"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">
                  {locale === "vi" ? "Giờ nhắc học" : "Reminder time"}
                </label>
                <input
                  id="time"
                  type="time"
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...form.register("time")}
                />
                {form.formState.errors.time ? (
                  <p className="text-xs text-destructive">{form.formState.errors.time.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium">
                  {locale === "vi" ? "Múi giờ" : "Timezone"}
                </label>
                <select
                  id="timezone"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...form.register("timezone")}
                >
                  {timezoneOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {locale === "vi"
                    ? `Đang xem lịch theo ${timezone}`
                    : `Schedule preview is shown in ${timezone}`}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{locale === "vi" ? "Ngày nhắc" : "Reminder days"}</p>
                <div className="flex flex-wrap gap-2">
                  {weekdayLabels.map((label, day) => (
                    <Button
                      key={label}
                      type="button"
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      onClick={() => toggleDay(day)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.daysOfWeek ? (
                  <p className="text-xs text-destructive">
                    {locale === "vi" ? "Hãy chọn ít nhất một ngày" : "Please choose at least one day"}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 rounded-xl border bg-card/70 p-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="dailyReminder" className="text-sm font-medium">
                    {locale === "vi" ? "Nhắc học hằng ngày" : "Daily reminder"}
                  </label>
                  <Switch
                    id="dailyReminder"
                    checked={dailyReminderEnabled}
                    onCheckedChange={(checked) => form.setValue("dailyReminder", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="weeklyReport" className="text-sm font-medium">
                    {locale === "vi" ? "Báo cáo tuần" : "Weekly report"}
                  </label>
                  <Switch
                    id="weeklyReport"
                    checked={weeklyReportEnabled}
                    onCheckedChange={(checked) => form.setValue("weeklyReport", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="streakWarning" className="text-sm font-medium">
                    {locale === "vi" ? "Cảnh báo mất streak" : "Streak warning"}
                  </label>
                  <Switch
                    id="streakWarning"
                    checked={streakWarningEnabled}
                    onCheckedChange={(checked) => form.setValue("streakWarning", checked)}
                  />
                </div>
              </div>

              <Button type="submit">
                {locale === "vi" ? "Lưu thay đổi" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "vi" ? "Thông tin reminder" : "Reminder summary"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">{locale === "vi" ? "Trạng thái" : "Status"}</p>
              <p className="font-semibold">
                {demoState.reminder.enabled
                  ? locale === "vi"
                    ? "Đang hoạt động"
                    : "Active"
                  : locale === "vi"
                    ? "Đang tắt"
                    : "Disabled"}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">{locale === "vi" ? "Lần nhắc tiếp theo" : "Next reminder"}</p>
              <p className="font-semibold" suppressHydrationWarning>{nextReminderLabel}</p>
              <p className="text-xs text-muted-foreground">{demoState.reminder.timezone}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">{locale === "vi" ? "Thống kê học" : "Study snapshot"}</p>
              <p>
                {locale === "vi" ? "Streak hiện tại" : "Current streak"}: {demoState.studyStats.streakDays}
              </p>
              <p>
                {locale === "vi" ? "Thẻ đã học hôm nay" : "Cards today"}: {demoState.studyStats.todayCards}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="mb-2 text-xs text-muted-foreground">{locale === "vi" ? "Xem trước thông báo" : "Notification preview"}</p>
              <div className="space-y-2">
                {notificationPreview.map((item) => (
                  <p key={item.id}>{locale === "vi" ? item.textVi : item.textEn}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
