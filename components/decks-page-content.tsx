"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { readDemoState, updateDemoState } from "@/lib/demo-store";
import { BookOpen, Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DecksPageContent() {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
  const [demoState, setDemoState] = useState(() => readDemoState());

  const decks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return demoState.decks
      .map((deck) => {
        const status =
          deck.dueToday > 12
            ? t("decks.due")
            : deck.mastered > deck.cards * 0.6
              ? t("decks.active")
              : t("decks.new");

        return {
          ...deck,
          level: locale === "vi" ? deck.levelVi : deck.levelEn,
          desc: locale === "vi" ? deck.descVi : deck.descEn,
          status,
        };
      })
      .filter((deck) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          deck.name.toLowerCase().includes(normalizedQuery) ||
          deck.level.toLowerCase().includes(normalizedQuery)
        );
      });
  }, [demoState.decks, locale, query, t]);

  const createDeck = () => {
    const timestamp = Date.now();
    const newDeck = {
      id: `deck-${timestamp}`,
      name:
        locale === "vi"
          ? `Bo tu moi ${demoState.decks.length + 1}`
          : `New deck ${demoState.decks.length + 1}`,
      descVi: "Bo tu do ban tao trong che do demo",
      descEn: "Deck created by you in demo mode",
      cards: 40,
      mastered: 0,
      reviewedToday: 0,
      levelVi: "Moi",
      levelEn: "New",
      dueToday: 20,
    };

    const nextState = updateDemoState((current) => ({
      ...current,
      decks: [newDeck, ...current.decks],
      selectedDeckId: newDeck.id,
    }));

    setDemoState(nextState);
    toast.success(locale === "vi" ? "Da tao bo tu demo" : "Demo deck created");
  };

  const selectDeck = (deckId: string) => {
    const nextState = updateDemoState((current) => ({
      ...current,
      selectedDeckId: deckId,
    }));

    setDemoState(nextState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">TailFlash</span>
          </Link>

          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/study">
              <Button variant="ghost" size="sm">
                Study
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                {t("common.dashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("decks.title")}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("decks.subtitle")}</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={createDeck}>
            <Plus className="mr-2 h-4 w-4" />
            {t("decks.createDeck")}
          </Button>
        </section>

        <section className="mb-6">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={t("decks.searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {decks.map((deck) => (
            <Card key={deck.id} className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{deck.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {deck.cards} flashcards
                  </p>
                </div>
                <Badge variant="secondary">{deck.status}</Badge>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {t("decks.level")}: {deck.level}
              </div>

              {expandedDeckId === deck.id && (
                <div className="mb-4 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>{deck.desc}</p>
                  <p className="mt-1">
                    {locale === "vi" ? "Can on hom nay" : "Due today"}: {deck.dueToday}
                  </p>
                  <p>
                    {locale === "vi" ? "Da nho" : "Mastered"}: {deck.mastered}/{deck.cards}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Link href="/study/session" className="flex-1">
                  <Button
                    className="w-full"
                    onClick={() => selectDeck(deck.id)}
                  >
                    {t("decks.start")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1"
                  type="button"
                  onClick={() =>
                    setExpandedDeckId((current) =>
                      current === deck.id ? null : deck.id,
                    )
                  }
                >
                  {t("decks.detail")}
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
