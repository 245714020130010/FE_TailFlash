"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import { completeMiniTest, readDemoState } from "@/lib/demo-store";

type MiniTestMode = "vocabulary" | "context" | "comprehensive";

export default function MiniTestPage() {
  const { locale } = useLanguage();
  const [demoState, setDemoState] = useState(() => readDemoState());
  const [isStarted, setIsStarted] = useState(false);
  const [mode, setMode] = useState<MiniTestMode>("comprehensive");
  const [deckFilter, setDeckFilter] = useState("all");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = useMemo(() => {
    const byDeck =
      deckFilter === "all"
        ? demoState.miniTestQuestionBank
        : demoState.miniTestQuestionBank.filter((question) => question.deckId === deckFilter);

    const byMode =
      mode === "vocabulary"
        ? byDeck.filter(
            (question) =>
              question.prompt.toLowerCase().includes("meaning") ||
              question.prompt.toLowerCase().includes("synonym"),
          )
        : mode === "context"
          ? byDeck.filter((question) => question.prompt.includes("___"))
          : byDeck;

    const fallback = byMode.length > 0 ? byMode : byDeck;
    return fallback.slice(0, Math.max(1, Math.min(questionLimit, fallback.length)));
  }, [deckFilter, demoState.miniTestQuestionBank, mode, questionLimit]);

  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = useMemo(() => {
    return questions.reduce((count, question) => {
      if (selectedAnswers[question.id] === question.answerIndex) {
        return count + 1;
      }

      return count;
    }, 0);
  }, [questions, selectedAnswers]);

  const progress = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);

  const submitTest = useCallback((input?: { auto?: boolean; allowIncomplete?: boolean }) => {
    const auto = Boolean(input?.auto);
    const allowIncomplete = Boolean(input?.allowIncomplete);

    if (!allowIncomplete && answeredCount < questions.length) {
      toast.error(locale === "vi" ? "Bạn chưa hoàn thành hết câu hỏi" : "Please answer all questions first");
      return false;
    }

    const scorePercent = Math.round((score / Math.max(1, questions.length)) * 100);
    const nextState = completeMiniTest({
      scorePercent,
      totalQuestions: questions.length,
      correctCount: score,
    });
    setDemoState(nextState);
    setIsSubmitted(true);

    if (auto) {
      toast.warning(locale === "vi" ? "Hết thời gian, đã tự động nộp bài" : "Time is up, test auto-submitted");
    } else {
      toast.success(locale === "vi" ? "Đã lưu kết quả mini test" : "Mini test result saved");
    }

    return true;
  }, [answeredCount, locale, questions.length, score]);

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
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsStarted(false);
    setRemainingSeconds(0);
  };

  const startTest = () => {
    if (questions.length === 0) {
      toast.error(locale === "vi" ? "Không có câu hỏi phù hợp" : "No matching questions found");
      return;
    }

    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsStarted(true);
    setRemainingSeconds(timeLimitMinutes > 0 ? timeLimitMinutes * 60 : 0);
  };

  const wrongQuestions = useMemo(
    () =>
      questions.filter(
        (question) => selectedAnswers[question.id] !== undefined && selectedAnswers[question.id] !== question.answerIndex,
      ),
    [questions, selectedAnswers],
  );

  const timerLabel = useMemo(() => {
    if (!isStarted || timeLimitMinutes <= 0) {
      return locale === "vi" ? "Không giới hạn" : "No limit";
    }

    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [isStarted, locale, remainingSeconds, timeLimitMinutes]);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p>{locale === "vi" ? "Chưa có câu hỏi demo" : "No demo questions available"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{locale === "vi" ? "Mini Test" : "Mini Test"}</h1>
            <p className="text-sm text-muted-foreground">
              {locale === "vi" ? "Kiểm tra nhanh từ vựng theo bộ thẻ" : "Quick vocabulary checks by deck"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/study">
              <Button variant="outline">{locale === "vi" ? "Quay lai" : "Back"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {locale === "vi" ? "Da lam" : "Completed"}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.testsTaken}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {locale === "vi" ? "Diem cao nhat" : "Best score"}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.bestScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {locale === "vi" ? "Trung binh" : "Average"}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.averageScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {locale === "vi" ? "Diem moi nhat" : "Last score"}
              </p>
              <p className="text-2xl font-bold">{demoState.miniTestStats.lastScore}%</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{locale === "vi" ? "Thiết lập bài test" : "Test setup"}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="mode" className="text-sm font-medium">
                  {locale === "vi" ? "Dạng bài" : "Mode"}
                </label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as MiniTestMode)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="vocabulary">{locale === "vi" ? "Vocabulary" : "Vocabulary"}</option>
                  <option value="context">{locale === "vi" ? "Context" : "Context"}</option>
                  <option value="comprehensive">{locale === "vi" ? "Tổng hợp" : "Comprehensive"}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="deck-filter" className="text-sm font-medium">
                  {locale === "vi" ? "Nguồn câu hỏi" : "Question source"}
                </label>
                <select
                  id="deck-filter"
                  value={deckFilter}
                  onChange={(event) => setDeckFilter(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value="all">{locale === "vi" ? "Trộn nhiều deck" : "Mix all decks"}</option>
                  {demoState.decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="question-limit" className="text-sm font-medium">
                  {locale === "vi" ? "Số câu" : "Questions"}
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
                  {locale === "vi" ? "Giới hạn thời gian" : "Time limit"}
                </label>
                <select
                  id="time-limit"
                  value={timeLimitMinutes}
                  onChange={(event) => setTimeLimitMinutes(Number(event.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isStarted && !isSubmitted}
                >
                  <option value={0}>{locale === "vi" ? "Không giới hạn" : "No limit"}</option>
                  <option value={3}>3 {locale === "vi" ? "phút" : "minutes"}</option>
                  <option value={5}>5 {locale === "vi" ? "phút" : "minutes"}</option>
                  <option value={10}>10 {locale === "vi" ? "phút" : "minutes"}</option>
                </select>
              </div>
            </div>

            {!isStarted || isSubmitted ? (
              <Button type="button" onClick={startTest}>
                {locale === "vi" ? "Bắt đầu bài test" : "Start test"}
              </Button>
            ) : (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                {locale === "vi" ? "Bài test đang chạy" : "Test is running"}
              </div>
            )}
          </CardContent>
        </Card>

        {isStarted && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  {locale === "vi"
                    ? `Câu ${currentIndex + 1}/${questions.length}`
                    : `Question ${currentIndex + 1}/${questions.length}`}
                </CardTitle>
                <div className="text-right text-sm text-muted-foreground">
                  <p>
                    {locale === "vi" ? `${answeredCount}/${questions.length} đã trả lời` : `${answeredCount}/${questions.length} answered`}
                  </p>
                  <p>
                    {locale === "vi" ? "Thời gian" : "Time"}: {timerLabel}
                  </p>
                </div>
              </div>
              <Progress value={progress} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-medium">{currentQuestion.prompt}</p>
              <div className="grid gap-3">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === index;
                  const showResult = isSubmitted;
                  const isCorrect = currentQuestion.answerIndex === index;

                  return (
                    <Button
                      key={choice}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => {
                        if (!isSubmitted) {
                          setSelectedAnswers((current) => ({
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

              {isSubmitted ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    {locale === "vi" ? "Kết quả" : "Result"}: {score}/{questions.length} ({Math.round((score / Math.max(1, questions.length)) * 100)}%)
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
                  {locale === "vi" ? "Câu trước" : "Previous"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  {locale === "vi" ? "Câu tiếp" : "Next"}
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitted}>
                  {locale === "vi" ? "Nộp bài" : "Submit"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetTest}>
                  {locale === "vi" ? "Làm lại" : "Retry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isSubmitted && wrongQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{locale === "vi" ? "Câu cần ôn lại" : "Questions to review"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((question) => (
                <div key={question.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{question.prompt}</p>
                  <p className="text-muted-foreground">
                    {locale === "vi" ? "Đáp án đúng" : "Correct answer"}: {question.choices[question.answerIndex]}
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
