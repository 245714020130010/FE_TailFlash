"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import {
  createDefaultDemoState,
  readDemoState,
  saveSrsSettings,
  type DemoCardOrder,
} from "@/lib/demo-store";

export default function SrsSettingsPage() {
  const { locale } = useLanguage();
  const defaultDemoState = useMemo(() => createDefaultDemoState(), []);
  const [demoState, setDemoState] = useState(defaultDemoState);
  const [newCardsPerDay, setNewCardsPerDay] = useState(demoState.srsSettings.newCardsPerDay);
  const [maxReviewCardsPerDay, setMaxReviewCardsPerDay] = useState(
    demoState.srsSettings.maxReviewCardsPerDay,
  );
  const [cardOrder, setCardOrder] = useState<DemoCardOrder>(demoState.srsSettings.cardOrder);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hydrated = readDemoState();
      setDemoState(hydrated);
      setNewCardsPerDay(hydrated.srsSettings.newCardsPerDay);
      setMaxReviewCardsPerDay(hydrated.srsSettings.maxReviewCardsPerDay);
      setCardOrder(hydrated.srsSettings.cardOrder);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const save = () => {
    const next = saveSrsSettings({
      newCardsPerDay,
      maxReviewCardsPerDay,
      cardOrder,
    });
    setDemoState(next);
    setNewCardsPerDay(next.srsSettings.newCardsPerDay);
    setMaxReviewCardsPerDay(next.srsSettings.maxReviewCardsPerDay);
    setCardOrder(next.srsSettings.cardOrder);
    toast.success(locale === "vi" ? "Đã lưu SRS settings" : "SRS settings saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">SRS Settings</h1>
            <p className="text-sm text-muted-foreground">
              {locale === "vi"
                ? "Tùy chỉnh số thẻ mới, giới hạn ôn tập và thứ tự thẻ"
                : "Configure new cards, review limit, and card order"}
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

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "vi" ? "Thiết lập học" : "Learning setup"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="new-cards" className="text-sm font-medium">
                {locale === "vi" ? "Cards mới mỗi ngày" : "New cards per day"}
              </label>
              <input
                id="new-cards"
                type="number"
                min={1}
                max={100}
                value={newCardsPerDay}
                onChange={(event) => setNewCardsPerDay(Number(event.target.value) || 1)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="review-cards" className="text-sm font-medium">
                {locale === "vi" ? "Cards ôn tập tối đa mỗi ngày" : "Max review cards per day"}
              </label>
              <input
                id="review-cards"
                type="number"
                min={5}
                max={300}
                value={maxReviewCardsPerDay}
                onChange={(event) => setMaxReviewCardsPerDay(Number(event.target.value) || 5)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="card-order" className="text-sm font-medium">
                {locale === "vi" ? "Thứ tự thẻ" : "Card order"}
              </label>
              <select
                id="card-order"
                value={cardOrder}
                onChange={(event) => setCardOrder(event.target.value as DemoCardOrder)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="sequential">{locale === "vi" ? "Sequential" : "Sequential"}</option>
                <option value="random">{locale === "vi" ? "Random" : "Random"}</option>
              </select>
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              {locale === "vi"
                ? `Đang dùng: ${demoState.srsSettings.newCardsPerDay} cards mới/ngày, ${demoState.srsSettings.maxReviewCardsPerDay} cards ôn tập tối đa/ngày, thứ tự ${demoState.srsSettings.cardOrder}.`
                : `Current: ${demoState.srsSettings.newCardsPerDay} new cards/day, ${demoState.srsSettings.maxReviewCardsPerDay} max review cards/day, ${demoState.srsSettings.cardOrder} order.`}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={save}>
                {locale === "vi" ? "Lưu cài đặt" : "Save settings"}
              </Button>
              <Link href="/study/session">
                <Button type="button" variant="outline">
                  {locale === "vi" ? "Bắt đầu phiên học" : "Start session"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
