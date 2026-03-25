"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { readDemoState, recordStudyResult } from "@/lib/demo-store";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Volume2,
  MessageCircle,
  Home,
} from "lucide-react";

interface Flashcard {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  wordType: string;
  status: "new" | "learning" | "review" | "graduated";
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    word: "Accomplish",
    pronunciation: "/əˈkɑːm.plɪʃ/",
    meaning: "Hoàn thành, thực hiện",
    example: "She accomplished her goals despite the challenges.",
    wordType: "Verb",
    status: "new",
  },
  {
    id: 2,
    word: "Abundant",
    pronunciation: "/əˈbʌn.dənt/",
    meaning: "Phong phú, dồi dào",
    example: "The region has abundant natural resources.",
    wordType: "Adjective",
    status: "new",
  },
  {
    id: 3,
    word: "Abrupt",
    pronunciation: "/əˈbrʌpt/",
    meaning: "Đột ngột, bất ngờ",
    example: "The meeting came to an abrupt end.",
    wordType: "Adjective",
    status: "learning",
  },
  {
    id: 4,
    word: "Abstain",
    pronunciation: "/æbˈsteɪn/",
    meaning: "Kiêng, tránh",
    example: "He decided to abstain from drinking alcohol.",
    wordType: "Verb",
    status: "learning",
  },
  {
    id: 5,
    word: "Abstract",
    pronunciation: "/ˈæb.strækt/",
    meaning: "Trừu tượng",
    example: "Abstract art can be difficult to interpret.",
    wordType: "Adjective",
    status: "review",
  },
];

export default function FlashcardStudyPage() {
  const [selectedDeckName] = useState(() => {
    const state = readDemoState();
    const selectedDeck = state.decks.find((deck) => deck.id === state.selectedDeckId);
    return selectedDeck?.name ?? "TOEIC Core";
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cards = useMemo(() => SAMPLE_FLASHCARDS, []);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [studySession, setStudySession] = useState(true);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = useCallback((correct: boolean) => {
    if (correct) {
      setCorrectCount(correctCount + 1);
    }
    setLastAnswerCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setShowResult(false);
        setLastAnswerCorrect(null);
      } else {
        const state = readDemoState();
        recordStudyResult({
          correctCount: correct ? correctCount + 1 : correctCount,
          totalCards: cards.length,
          deckId: state.selectedDeckId,
        });
        toast.success("Da luu ket qua phien hoc demo");
        setStudySession(false);
      }
    }, 1000);
  }, [cards.length, correctCount, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFlipped || showResult) {
        return;
      }

      if (event.key === "1" || event.key === "2") {
        handleResponse(false);
      }

      if (event.key === "3" || event.key === "4") {
        handleResponse(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleResponse, isFlipped, showResult]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setCorrectCount(0);
    setStudySession(true);
    setLastAnswerCorrect(null);
  };

  if (!studySession) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/study" aria-label="Quay lại trang study">
                <Button variant="ghost" size="sm" className="h-9 w-9">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-foreground">
                  {selectedDeckName}
                </h1>
              </div>
            </div>
            <Link href="/" aria-label="Về trang chủ">
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md border-0 shadow-lg p-8 sm:p-10 text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Hoàn tất buổi học!
              </h2>
              <p className="text-muted-foreground">
                Bạn đã hoàn thành buổi học hôm nay
              </p>
            </div>

            {/* Results Card */}
            <div className="space-y-4 mb-8 p-6 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Số flashcard học</span>
                <span className="text-2xl font-bold text-foreground">
                  {cards.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Câu đúng</span>
                <span className="text-2xl font-bold text-primary">
                  {correctCount}/{cards.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tỷ lệ chính xác</span>
                <span className="text-2xl font-bold text-accent">
                  {Math.round((correctCount / cards.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRestart}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Học lại bộ này
              </Button>
              <Link href="/study" className="block">
                <Button variant="outline" className="w-full border-border">
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/study" aria-label="Quay lại trang study">
                <Button variant="ghost" size="sm" className="h-9 w-9">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-foreground">
                  {selectedDeckName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  New + Review · phím 1-4 để chọn mức nhớ
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {currentIndex + 1}/{cards.length}
              </div>
              <div className="text-xs text-muted-foreground">Tiến độ</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          {/* Flashcard */}
          <div
            onClick={handleFlip}
            className="perspective cursor-pointer h-80 mb-8"
          >
            <Card
              className={`h-full p-8 sm:p-12 flex flex-col justify-between items-center text-center transition-all duration-300 border-0 shadow-2xl ${
                !isFlipped
                  ? "bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-2xl"
                  : "bg-gradient-to-br from-secondary/10 to-accent/10 hover:shadow-2xl"
              }`}
            >
              {!isFlipped ? (
                <>
                  <div className="flex-1 flex items-center justify-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                        Mặt trước
                      </p>
                      <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        {currentCard.word}
                      </h2>
                      <p className="text-lg text-primary font-medium">
                        {currentCard.pronunciation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Volume2 className="w-4 h-4" />
                    Nhấp để phát âm
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Loại từ
                        </p>
                        <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent font-medium text-sm">
                          {currentCard.wordType}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Nghĩa
                        </p>
                        <p className="text-2xl sm:text-3xl font-semibold text-foreground">
                          {currentCard.meaning}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Ví dụ
                        </p>
                        <p className="text-base text-muted-foreground italic">
                          &quot;{currentCard.example}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <RotateCcw className="w-4 h-4" />
                    Nhấp để xem lại
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Action Buttons */}
          {!showResult && (
            <div className="space-y-3 sm:space-y-0 sm:flex gap-3 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-border hover:bg-muted"
                type="button"
                onClick={() => toast.info("Ghi chu demo se co o ban backend")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ghi chú
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-border hover:bg-muted"
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setShowResult(false);
                  toast.info("The hien tai da duoc lap lai");
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Lặp lại
              </Button>
            </div>
          )}

          {/* Response Buttons */}
          {isFlipped && !showResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <Button
                onClick={() => handleResponse(false)}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <span className="text-xs sm:text-sm font-medium">Quên</span>
              </Button>
              <Button
                onClick={() => handleResponse(false)}
                variant="outline"
                className="border-muted-foreground hover:bg-muted"
              >
                <span className="text-xs sm:text-sm font-medium">Khó</span>
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <span className="text-xs sm:text-sm font-medium">Tốt</span>
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <span className="text-xs sm:text-sm font-medium">Dễ</span>
              </Button>
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className="animate-in fade-in-50 duration-300">
              <div
                className={`p-4 rounded-lg text-center font-medium ${
                  lastAnswerCorrect
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {lastAnswerCorrect
                  ? "✓ Tuyệt vời! Bạn đã ghi nhớ từ này"
                  : "→ Cần ôn tập thêm từ này"}
              </div>
            </div>
          )}

          {/* Study Stats */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border">
            <div className="text-center p-3 rounded-lg bg-card">
              <div className="text-2xl font-bold text-primary">
                {correctCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Đúng</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card">
              <div className="text-2xl font-bold text-accent">
                {currentIndex + 1 - correctCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sai</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card">
              <div className="text-2xl font-bold text-secondary">
                {Math.round((correctCount / (currentIndex + 1)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Chính xác</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
