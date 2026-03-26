"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import {
  completeMiniTest,
  type DemoMiniTestQuestion,
  type DemoMiniTestQuestionType,
  readDemoState,
} from "@/lib/demo-store";

type MiniTestMode = "vocabulary" | "listening" | "fillBlank" | "context" | "comprehensive";
type QuestionSourceMode = "all" | "wrongFrequent" | "dueSoon";
type ListeningDifficulty = "easy" | "medium" | "hard";
type TestDifficulty = "easy" | "medium" | "hard";
type ListeningAccent = "en-US" | "en-GB";
const SRS_LEGEND_ANIMATED_KEY = "tailflash-srs-legend-animated";

function getRandomAccent(): ListeningAccent {
  return Math.random() < 0.5 ? "en-US" : "en-GB";
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isChoiceQuestion(type: DemoMiniTestQuestionType): boolean {
  return type !== "fillBlank";
}

function getDueLevelTone(level: "high" | "medium" | "low"): string {
  if (level === "high") {
    return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  if (level === "medium") {
    return "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

export default function MiniTestPage() {
  const { locale, t } = useLanguage();
  const [demoState, setDemoState] = useState(() => readDemoState());
  const [isStarted, setIsStarted] = useState(false);
  const [mode, setMode] = useState<MiniTestMode>("comprehensive");
  const [sourceMode, setSourceMode] = useState<QuestionSourceMode>("all");
  const [deckFilter, setDeckFilter] = useState("all");
  const [listeningDifficulty, setListeningDifficulty] = useState<ListeningDifficulty>("medium");
  const [testDifficulty, setTestDifficulty] = useState<TestDifficulty>("medium");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceAnswers, setSelectedChoiceAnswers] = useState<Record<string, number>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [listeningReplayCount, setListeningReplayCount] = useState(0);
  const [currentAccent, setCurrentAccent] = useState<ListeningAccent>("en-US");
  const [nowMs] = useState(() => Date.now());

  const questions = useMemo(() => {
    const byDeck =
      deckFilter === "all"
        ? demoState.miniTestQuestionBank
        : demoState.miniTestQuestionBank.filter((question) => question.deckId === deckFilter);

    const bySource =
      sourceMode === "wrongFrequent"
        ? byDeck.filter((question) => question.wrongCount >= 2)
        : sourceMode === "dueSoon"
          ? byDeck.filter((question) => question.srsDueLevel === "medium" || question.srsDueLevel === "high")
          : byDeck;

    const byMode =
      mode === "vocabulary"
        ? bySource.filter((question) => question.type === "vocabulary")
        : mode === "listening"
          ? bySource.filter((question) => question.type === "listening")
          : mode === "fillBlank"
            ? bySource.filter((question) => question.type === "fillBlank")
            : mode === "context"
              ? bySource.filter((question) => question.type === "context")
          : bySource;

    const fallback = byMode.length > 0 ? byMode : bySource.length > 0 ? bySource : byDeck;
    return fallback.slice(0, Math.max(1, Math.min(questionLimit, fallback.length)));
  }, [deckFilter, demoState.miniTestQuestionBank, mode, questionLimit, sourceMode]);

  const currentQuestion = questions[currentIndex];

  const getPrompt = useCallback(
    (question: DemoMiniTestQuestion) => (locale === "vi" ? question.promptVi : question.promptEn),
    [locale],
  );

  const getDueLevelLabel = useCallback(
    (level: "high" | "medium" | "low") => {
      if (level === "high") {
        return t("tests.srsDueHigh");
      }

      if (level === "medium") {
        return t("tests.srsDueMedium");
      }

      return t("tests.srsDueLow");
    },
    [t],
  );

  const isQuestionAnswered = useCallback(
    (question: DemoMiniTestQuestion) => {
      if (question.type === "fillBlank") {
        return Boolean(typedAnswers[question.id]?.trim());
      }

      return selectedChoiceAnswers[question.id] !== undefined;
    },
    [selectedChoiceAnswers, typedAnswers],
  );

  const isQuestionCorrect = useCallback(
    (question: DemoMiniTestQuestion) => {
      if (question.type === "fillBlank") {
        return normalizeText(typedAnswers[question.id] ?? "") === normalizeText(question.answerText ?? "");
      }

      if (question.answerIndex === null) {
        return false;
      }

      return selectedChoiceAnswers[question.id] === question.answerIndex;
    },
    [selectedChoiceAnswers, typedAnswers],
  );

  const answeredCount = useMemo(
    () => questions.filter((question) => isQuestionAnswered(question)).length,
    [isQuestionAnswered, questions],
  );

  const score = useMemo(() => {
    return questions.reduce((count, question) => {
      if (isQuestionCorrect(question)) {
        return count + 1;
      }

      return count;
    }, 0);
  }, [isQuestionCorrect, questions]);

  const progress = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);

  const topWrongQuestions = useMemo(
    () =>
      [...demoState.miniTestQuestionBank]
        .filter((question) => question.wrongCount > 0)
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, 5),
    [demoState.miniTestQuestionBank],
  );

  const dueSoonQuestions = useMemo(() => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    return [...demoState.miniTestQuestionBank]
      .filter((question) => {
        if (question.srsDueLevel === "high") {
          return true;
        }

        if (question.srsDueLevel === "medium") {
          if (!question.lastReviewedAt) {
            return true;
          }

          const reviewedAt = new Date(question.lastReviewedAt).getTime();
          return Number.isFinite(reviewedAt) && nowMs - reviewedAt <= sevenDaysMs;
        }

        return false;
      })
      .sort((a, b) => {
        const dueOrder = { high: 2, medium: 1, low: 0 } as const;
        return dueOrder[b.srsDueLevel] - dueOrder[a.srsDueLevel] || b.wrongCount - a.wrongCount;
      })
      .slice(0, 5);
  }, [demoState.miniTestQuestionBank, nowMs]);

  const groupedTopWrongQuestions = useMemo(() => {
    const priorityOrder: Array<"high" | "medium" | "low"> = ["high", "medium", "low"];
    return priorityOrder
      .map((level) => ({
        level,
        questions: topWrongQuestions.filter((question) => question.srsDueLevel === level),
      }))
      .filter((group) => group.questions.length > 0);
  }, [topWrongQuestions]);

  const groupedDueSoonQuestions = useMemo(() => {
    const priorityOrder: Array<"high" | "medium" | "low"> = ["high", "medium", "low"];
    return priorityOrder
      .map((level) => ({
        level,
        questions: dueSoonQuestions.filter((question) => question.srsDueLevel === level),
      }))
      .filter((group) => group.questions.length > 0);
  }, [dueSoonQuestions]);

  const hasSrsData = topWrongQuestions.length > 0 || dueSoonQuestions.length > 0;

  const shouldAnimateLegend = useMemo(() => {
    if (!hasSrsData || typeof window === "undefined") {
      return false;
    }

    return window.sessionStorage.getItem(SRS_LEGEND_ANIMATED_KEY) !== "1";
  }, [hasSrsData]);

  const handleLegendAnimationEnd = useCallback(() => {
    if (!shouldAnimateLegend || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(SRS_LEGEND_ANIMATED_KEY, "1");
  }, [shouldAnimateLegend]);

  const submitTest = useCallback((input?: { auto?: boolean; allowIncomplete?: boolean }) => {
    const auto = Boolean(input?.auto);
    const allowIncomplete = Boolean(input?.allowIncomplete);

    if (!allowIncomplete && answeredCount < questions.length) {
      toast.error(t("tests.incompleteWarning"));
      return false;
    }

    const scorePercent = Math.round((score / Math.max(1, questions.length)) * 100);
    const answeredQuestions = questions
      .filter((question) => isQuestionAnswered(question))
      .map((question) => ({
        questionId: question.id,
        correct: isQuestionCorrect(question),
      }));

    const nextState = completeMiniTest({
      scorePercent,
      totalQuestions: questions.length,
      correctCount: score,
      difficulty: testDifficulty,
      answeredQuestions,
    });
    setDemoState(nextState);
    setIsSubmitted(true);

    if (auto) {
      toast.warning(t("tests.autoSubmitted"));
    } else {
      toast.success(t("tests.resultSaved"));
    }

    return true;
  }, [answeredCount, isQuestionAnswered, isQuestionCorrect, questions, score, t, testDifficulty]);

  useEffect(() => {
    if (!isStarted || isSubmitted || timeLimitMinutes <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.setTimeout(() => {
            submitTest({ auto: true, allowIncomplete: true });
          }, 0);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isStarted, isSubmitted, timeLimitMinutes, submitTest]);

  const handleSubmit = () => {
    submitTest();
  };

  const resetTest = () => {
    setSelectedChoiceAnswers({});
    setTypedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsStarted(false);
    setRemainingSeconds(0);
    setListeningReplayCount(0);
    setCurrentAccent("en-US");
  };

  const startTest = () => {
    if (questions.length === 0) {
      toast.error(t("tests.noMatchingQuestions"));
      return;
    }

    setSelectedChoiceAnswers({});
    setTypedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsStarted(true);
    setRemainingSeconds(timeLimitMinutes > 0 ? timeLimitMinutes * 60 : 0);
    setListeningReplayCount(0);
    setCurrentAccent("en-US");
  };

  const speakListeningPrompt = useCallback(
    (text: string, accent: ListeningAccent = getRandomAccent()) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast.error(t("tests.listeningNotSupported"));
        return;
      }

      try {
        const rateByDifficulty: Record<ListeningDifficulty, number> = {
          easy: 0.8,
          medium: 0.95,
          hard: 1.08,
        };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = accent;
        utterance.rate = rateByDifficulty[listeningDifficulty];

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find((voice) =>
          voice.lang.toLowerCase().startsWith(accent.toLowerCase()),
        );

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        toast.error(t("tests.listeningAudioError"));
      }
    },
    [listeningDifficulty, t],
  );

  useEffect(() => {
    if (!isStarted || isSubmitted || currentQuestion?.type !== "listening") {
      return;
    }

    const audioText = currentQuestion.audioText ?? currentQuestion.answerText ?? "";
    if (audioText) {
      speakListeningPrompt(audioText);
    }
  }, [currentQuestion, isStarted, isSubmitted, speakListeningPrompt]);

  const wrongQuestions = useMemo(
    () =>
      questions.filter(
        (question) => isQuestionAnswered(question) && !isQuestionCorrect(question),
      ),
    [isQuestionAnswered, isQuestionCorrect, questions],
  );

  const timerLabel = useMemo(() => {
    if (!isStarted || timeLimitMinutes <= 0) {
      return t("tests.noLimit");
    }

    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [isStarted, remainingSeconds, t, timeLimitMinutes]);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p>{t("tests.noQuestions")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("tests.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("tests.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/study">
              <Button variant="outline">{t("tests.back")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tests.completed")}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.testsTaken}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tests.bestScore")}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.bestScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tests.average")}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.averageScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tests.lastScore")}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.lastScore}%</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {hasSrsData ? (
            <div
              onAnimationEnd={handleLegendAnimationEnd}
              className={`sticky top-20 z-20 rounded-md border border-border/60 bg-background/90 p-3 backdrop-blur-sm lg:col-span-2 ${
                shouldAnimateLegend
                  ? "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-500"
                  : ""
              }`}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("tests.srsLegendTitle")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDueLevelTone("high")}>{getDueLevelLabel("high")}</Badge>
                <Badge className={getDueLevelTone("medium")}>{getDueLevelLabel("medium")}</Badge>
                <Badge className={getDueLevelTone("low")}>{getDueLevelLabel("low")}</Badge>
              </div>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{t("tests.srsTopWrongTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topWrongQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("tests.srsEmpty")}</p>
              ) : (
                groupedTopWrongQuestions.map((group) => (
                  <div key={`top-wrong-${group.level}`} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {getDueLevelLabel(group.level)} ({group.questions.length})
                    </p>
                    {group.questions.map((question) => (
                      <div key={question.id} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{getPrompt(question)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {t("tests.srsWrongCount")}: {question.wrongCount}
                          </span>
                          <Badge className={getDueLevelTone(question.srsDueLevel)}>
                            {t("tests.srsDueLevel")}: {getDueLevelLabel(question.srsDueLevel)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSourceMode("wrongFrequent");
                  setMode("comprehensive");
                }}
              >
                {t("tests.srsUseWrongSource")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("tests.srsDueWeekTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueSoonQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("tests.srsEmpty")}</p>
              ) : (
                groupedDueSoonQuestions.map((group) => (
                  <div key={`due-soon-${group.level}`} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {getDueLevelLabel(group.level)} ({group.questions.length})
                    </p>
                    {group.questions.map((question) => (
                      <div key={question.id} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{getPrompt(question)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {t("tests.srsWrongCount")}: {question.wrongCount}
                          </span>
                          <Badge className={getDueLevelTone(question.srsDueLevel)}>
                            {t("tests.srsDueLevel")}: {getDueLevelLabel(question.srsDueLevel)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSourceMode("dueSoon");
                  setMode("comprehensive");
                }}
              >
                {t("tests.srsUseDueSource")}
              </Button>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{t("tests.setupTitle")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="mode" className="text-sm font-medium">
                  {t("tests.mode")}
                </label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as MiniTestMode)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="vocabulary">{t("tests.modeVocabulary")}</option>
                  <option value="listening">{t("tests.modeListening")}</option>
                  <option value="fillBlank">{t("tests.modeFillBlank")}</option>
                  <option value="context">{t("tests.modeContext")}</option>
                  <option value="comprehensive">{t("tests.modeComprehensive")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="source-mode" className="text-sm font-medium">
                  {t("tests.source")}
                </label>
                <select
                  id="source-mode"
                  value={sourceMode}
                  onChange={(event) => setSourceMode(event.target.value as QuestionSourceMode)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="all">{t("tests.sourceAll")}</option>
                  <option value="wrongFrequent">{t("tests.sourceWrongFrequent")}</option>
                  <option value="dueSoon">{t("tests.sourceDueSoon")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="deck-filter" className="text-sm font-medium">
                  {t("tests.deckFilter")}
                </label>
                <select
                  id="deck-filter"
                  value={deckFilter}
                  onChange={(event) => setDeckFilter(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="all">{t("tests.deckAll")}</option>
                  {demoState.decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="listening-difficulty" className="text-sm font-medium">
                  {t("tests.difficulty")}
                </label>
                <select
                  id="listening-difficulty"
                  value={listeningDifficulty}
                  onChange={(event) => setListeningDifficulty(event.target.value as ListeningDifficulty)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="easy">{t("tests.difficultyEasy")}</option>
                  <option value="medium">{t("tests.difficultyMedium")}</option>
                  <option value="hard">{t("tests.difficultyHard")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="test-difficulty" className="text-sm font-medium">
                  {t("tests.testDifficulty")}
                </label>
                <select
                  id="test-difficulty"
                  value={testDifficulty}
                  onChange={(event) => setTestDifficulty(event.target.value as TestDifficulty)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="easy">{t("tests.difficultyEasy")}</option>
                  <option value="medium">{t("tests.difficultyMedium")}</option>
                  <option value="hard">{t("tests.difficultyHard")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="question-limit" className="text-sm font-medium">
                  {t("tests.questionCount")}
                </label>
                <input
                  id="question-limit"
                  type="number"
                  min={1}
                  max={demoState.miniTestQuestionBank.length}
                  value={questionLimit}
                  onChange={(event) => setQuestionLimit(Number(event.target.value) || 1)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="time-limit" className="text-sm font-medium">
                  {t("tests.timeLimit")}
                </label>
                <select
                  id="time-limit"
                  value={timeLimitMinutes}
                  onChange={(event) => setTimeLimitMinutes(Number(event.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value={0}>{t("tests.noLimit")}</option>
                  <option value={3}>3 {t("tests.minutes")}</option>
                  <option value={5}>5 {t("tests.minutes")}</option>
                  <option value={10}>10 {t("tests.minutes")}</option>
                </select>
              </div>
            </div>

            {!isStarted || isSubmitted ? (
              <Button type="button" onClick={startTest}>
                {t("tests.start")}
              </Button>
            ) : (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                {t("tests.running")}
              </div>
            )}
          </CardContent>
        </Card>

        {isStarted && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  {t("tests.questionLabel")} {currentIndex + 1}/{questions.length}
                </CardTitle>
                <div className="text-right text-sm text-muted-foreground">
                  <p>
                    {answeredCount}/{questions.length} {t("tests.answeredLabel")}
                  </p>
                  <p>
                    {t("tests.timeLabel")}: {timerLabel}
                  </p>
                </div>
              </div>
              <Progress value={progress} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-medium">{getPrompt(currentQuestion)}</p>

              {currentQuestion.type === "listening" && (
                <div className="space-y-2">
                  <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                    <p>{t("tests.listeningAccent")}: {currentAccent}</p>
                    <p>{t("tests.listeningSpeed")}: {listeningDifficulty}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const audioText = currentQuestion.audioText ?? currentQuestion.answerText ?? "";
                      if (audioText) {
                        const accent = getRandomAccent();
                        setListeningReplayCount((prev) => prev + 1);
                        setCurrentAccent(accent);
                        speakListeningPrompt(audioText, accent);
                      }
                    }}
                  >
                    {t("tests.listeningPlay")} ({listeningReplayCount})
                  </Button>
                </div>
              )}

              {isChoiceQuestion(currentQuestion.type) ? (
                <div className="grid gap-3">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = selectedChoiceAnswers[currentQuestion.id] === index;
                    const showResult = isSubmitted;
                    const isCorrect = currentQuestion.answerIndex === index;

                    return (
                      <Button
                        key={`${currentQuestion.id}-${choice}`}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => {
                          if (!isSubmitted) {
                            setSelectedChoiceAnswers((current) => ({
                              ...current,
                              [currentQuestion.id]: index,
                            }));
                          }
                        }}
                      >
                        <span className="mr-2 text-xs text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
                        <span>{choice}</span>
                        {showResult && isCorrect ? <span className="ml-auto text-xs">✓</span> : null}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={typedAnswers[currentQuestion.id] ?? ""}
                    onChange={(event) => {
                      if (!isSubmitted) {
                        setTypedAnswers((current) => ({
                          ...current,
                          [currentQuestion.id]: event.target.value,
                        }));
                      }
                    }}
                    placeholder={t("tests.fillBlankPlaceholder")}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />

                  {currentQuestion.choices.length > 0 && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-xs font-medium text-muted-foreground">{t("tests.fillBlankHint")}</p>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.choices.map((choice) => (
                          <Button
                            key={`${currentQuestion.id}-${choice}`}
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => {
                              if (!isSubmitted) {
                                setTypedAnswers((current) => ({
                                  ...current,
                                  [currentQuestion.id]: choice,
                                }));
                              }
                            }}
                          >
                            {choice}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSubmitted ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    {t("tests.result")}: {score}/{questions.length} ({Math.round((score / Math.max(1, questions.length)) * 100)}%)
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                >
                  {t("tests.previous")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  {t("tests.next")}
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitted}>
                  {t("tests.submit")}
                </Button>
                <Button type="button" variant="secondary" onClick={resetTest}>
                  {t("tests.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isSubmitted && wrongQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("tests.reviewTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((question) => (
                <div key={question.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{getPrompt(question)}</p>
                  <p className="text-muted-foreground">
                    {t("tests.correctAnswer")}: {question.type === "fillBlank" ? question.answerText : question.choices[question.answerIndex ?? 0]}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
