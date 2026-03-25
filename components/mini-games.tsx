"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";

type GameTab = "selection" | "matching" | "multiple" | "typing" | "builder";

export default function MiniGames() {
  const [activeTab, setActiveTab] = useState<GameTab>("selection");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [builtWord, setBuiltWord] = useState("");
  const { locale, t } = useLanguage();

  const games = useMemo(
    () => [
      {
        id: "matching" as const,
        icon: "🎯",
        title: t("games.matching"),
        duration: "5-10m",
      },
      {
        id: "multiple" as const,
        icon: "✓",
        title: t("games.multipleChoice"),
        duration: "8-12m",
      },
      {
        id: "typing" as const,
        icon: "⌨",
        title: t("games.typing"),
        duration: "10-15m",
      },
      {
        id: "builder" as const,
        icon: "🧩",
        title: t("games.builder"),
        duration: "10-15m",
      },
    ],
    [t],
  );

  const word =
    locale === "vi"
      ? { vi: "Khả năng thích ứng", en: "Adaptable" }
      : { vi: "Ability to adjust quickly", en: "Adaptable" };
  const letters = "ADAPTABLE".split("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("games.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("games.subtitle")}
            </p>
          </div>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === "selection" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer transition hover:shadow-md"
                  onClick={() => setActiveTab(game.id)}
                >
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-3xl">{game.icon}</p>
                      <span className="text-xs text-muted-foreground">
                        {game.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{game.title}</h3>
                    <Button className="mt-4" variant="outline">
                      {t("games.play")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t("games.yourStats")}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.gamesPlayed")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.averageScore")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.perfectScore")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">285</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.pointsEarned")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "matching" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.matching")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={45} className="mb-4" />
              <p className="mb-4 text-sm text-muted-foreground">
                {locale === "vi"
                  ? "Nối từ với nghĩa đúng để hoàn thành bài."
                  : "Match words to their correct meanings."}
              </p>
              <Button
                onClick={() => setActiveTab("selection")}
                variant="outline"
              >
                {t("games.backToGames")}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "multiple" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.multipleChoice")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={30} />
              <p className="rounded-md bg-muted p-4 text-center">{word.vi}</p>
              {["Adaptable", "Abundant", "Awkward", "Abstract"].map(
                (option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {option}
                  </Button>
                ),
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                >
                  {t("games.backToGames")}
                </Button>
                <Button>{t("games.nextQuestion")}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "typing" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.typing")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={60} />
              <p className="rounded-md bg-muted p-4 text-center">{word.vi}</p>
              <input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-2"
                placeholder={
                  locale === "vi" ? "Nhập đáp án..." : "Type your answer..."
                }
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                >
                  {t("games.backToGames")}
                </Button>
                <Button disabled={!typedAnswer}>
                  {t("games.submitAnswer")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "builder" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.builder")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={80} />
              <p className="rounded-md bg-muted p-4 text-center">
                {locale === "vi"
                  ? "Sắp xếp chữ để tạo từ đúng"
                  : "Arrange letters into the right word"}
              </p>
              <div className="min-h-12 rounded-md border border-dashed border-border p-2">
                {builtWord}
              </div>
              <div className="flex flex-wrap gap-2">
                {letters.map((letter, idx) => (
                  <Button
                    key={`${letter}-${idx}`}
                    size="sm"
                    variant="outline"
                    onClick={() => setBuiltWord((prev) => prev + letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBuiltWord("")}>
                  {t("games.reset")}
                </Button>
                <Button onClick={() => setActiveTab("selection")}>
                  {t("games.submitAnswer")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
