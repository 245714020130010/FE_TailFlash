"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import {
  createDefaultDemoState,
  type DemoGameType,
  readDemoState,
  recordGameResult,
} from "@/lib/demo-store";
import { toast } from "sonner";

type GameTab =
  | "selection"
  | "matching"
  | "multiple"
  | "typing"
  | "builder"
  | "memoryFlip"
  | "sprint"
  | "listening";
type Difficulty = "easy" | "medium" | "hard";
type LeaderboardRange = "weekly" | "monthly" | "all";
type ListeningVoiceLocale = "en-US" | "en-GB";

type MemoryPair = {
  pairId: string;
  word: string;
  meaning: string;
};

type MemoryCard = {
  id: string;
  pairId: string;
  label: string;
  matched: boolean;
};

type MemoryDeckConfig = {
  pairCount: number;
  timeSeconds: number;
  recommendedDifficulty: Difficulty;
};

const difficultyPointMultiplier: Record<Difficulty, number> = {
  easy: 0.85,
  medium: 1,
  hard: 1.2,
};

function shuffleArray<T>(input: T[]): T[] {
  const next = [...input];
  for (let idx = next.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(Math.random() * (idx + 1));
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  }
  return next;
}

export default function MiniGames() {
  const defaultState = useMemo(() => createDefaultDemoState(), []);
  const [activeTab, setActiveTab] = useState<GameTab>("selection");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [builtWord, setBuiltWord] = useState("");
  const [memoryDeck, setMemoryDeck] = useState<MemoryCard[]>([]);
  const [memoryOpenIds, setMemoryOpenIds] = useState<string[]>([]);
  const [memoryMatchedPairs, setMemoryMatchedPairs] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [memoryTimeLeft, setMemoryTimeLeft] = useState(0);
  const [memoryFinished, setMemoryFinished] = useState(false);
  const [matchingAnswer, setMatchingAnswer] = useState("");
  const [multipleAnswer, setMultipleAnswer] = useState("");
  const [multipleSubmitted, setMultipleSubmitted] = useState(false);
  const [typingSubmitted, setTypingSubmitted] = useState(false);
  const [builderSubmitted, setBuilderSubmitted] = useState(false);
  const [sprintRound, setSprintRound] = useState(0);
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(30);
  const [listeningAnswer, setListeningAnswer] = useState("");
  const [listeningSubmitted, setListeningSubmitted] = useState(false);
  const [listeningReplay, setListeningReplay] = useState(0);
  const [listeningVoiceLocale, setListeningVoiceLocale] = useState<ListeningVoiceLocale>(
    "en-US",
  );
  const [demoState, setDemoState] = useState(defaultState);
  const [selectedDeckId, setSelectedDeckId] = useState(defaultState.selectedDeckId);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [leaderboardRange, setLeaderboardRange] = useState<LeaderboardRange>("weekly");
  const [nowMs, setNowMs] = useState(0);
  const { locale, t } = useLanguage();

  useEffect(() => {
    const hydrationFrame = window.requestAnimationFrame(() => {
      const hydrated = readDemoState();
      setDemoState(hydrated);
      setSelectedDeckId(hydrated.selectedDeckId);
      setNowMs(Date.now());
    });

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => {
      window.cancelAnimationFrame(hydrationFrame);
      window.clearInterval(timer);
    };
  }, []);

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
      {
        id: "memoryFlip" as const,
        icon: "🧠",
        title: t("games.memoryFlip"),
        duration: "6-10m",
      },
      {
        id: "sprint" as const,
        icon: "⚡",
        title: t("games.sprint"),
        duration: "3-5m",
      },
      {
        id: "listening" as const,
        icon: "🎧",
        title: t("games.listening"),
        duration: "5-8m",
      },
    ],
    [t],
  );

  const selectedDeck = useMemo(
    () => demoState.decks.find((deck) => deck.id === selectedDeckId) ?? demoState.decks[0],
    [demoState.decks, selectedDeckId],
  );

  const challengeWord = useMemo(() => {
    if (!selectedDeck) {
      return {
        viPrompt: "Khả năng thích ứng",
        enPrompt: "Ability to adjust quickly",
        answer: "Adaptable",
      };
    }

    if (selectedDeck.id === "business-english") {
      return {
        viPrompt: "Thương lượng để đạt thỏa thuận",
        enPrompt: "Discuss terms to reach an agreement",
        answer: "Negotiate",
      };
    }

    if (selectedDeck.id === "daily-conversation") {
      return {
        viPrompt: "Dành thời gian thư giãn với bạn bè",
        enPrompt: "Spend relaxed time with friends",
        answer: "Hang out",
      };
    }

    return {
      viPrompt: "Khả năng thích ứng",
      enPrompt: "Ability to adjust quickly",
      answer: "Adaptable",
    };
  }, [selectedDeck]);

  const promptText = locale === "vi" ? challengeWord.viPrompt : challengeWord.enPrompt;
  const letters = challengeWord.answer.toUpperCase().replaceAll(" ", "").split("");

  const playerRank = useMemo(
    () => demoState.gameLeaderboard.findIndex((entry) => entry.id === "you") + 1,
    [demoState.gameLeaderboard],
  );

  const countdownLabel = useMemo(() => {
    const diff = new Date(demoState.dailyChallenge.expiresAt).getTime() - nowMs;
    if (diff <= 0) {
      return t("games.refreshing");
    }

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  }, [demoState.dailyChallenge.expiresAt, nowMs, t]);

  const listeningOptions = useMemo(() => {
    const correct = locale === "vi" ? challengeWord.viPrompt : challengeWord.enPrompt;
    return [
      correct,
      t("games.listeningOptionAbstract"),
      t("games.listeningOptionDelay"),
      t("games.listeningOptionNotAdaptable"),
    ];
  }, [challengeWord.enPrompt, challengeWord.viPrompt, locale, t]);

  const leaderboard = useMemo(() => {
    const factor =
      leaderboardRange === "weekly" ? 0.85 : leaderboardRange === "monthly" ? 0.95 : 1;
    return demoState.gameLeaderboard
      .map((entry) => ({ ...entry, viewPoints: Math.round(entry.points * factor) }))
      .sort((a, b) => b.viewPoints - a.viewPoints);
  }, [demoState.gameLeaderboard, leaderboardRange]);

  const sprintQuestionPool = useMemo(() => {
    if (selectedDeck?.id === "business-english") {
      return [
        { prompt: "Reach agreement with another party", options: ["Negotiate", "Ignore", "Delay", "Cancel"], answer: "Negotiate" },
        { prompt: "Assigned specific responsibility", options: ["Delegate", "Confuse", "Avoid", "Pause"], answer: "Delegate" },
        { prompt: "Present data in a short visual form", options: ["Summarize", "Scatter", "Complicate", "Expand"], answer: "Summarize" },
        { prompt: "Request additional resources", options: ["Allocate", "Ask for", "Reject", "Freeze"], answer: "Ask for" },
        { prompt: "Deliver before the deadline", options: ["Postpone", "Miss", "Complete", "Abandon"], answer: "Complete" },
      ];
    }

    return [
      { prompt: "Spend time socially", options: ["Hang out", "Give up", "Turn down", "Break down"], answer: "Hang out" },
      { prompt: "Leave quickly", options: ["Take off", "Hold on", "Bring up", "Look up"], answer: "Take off" },
      { prompt: "Continue despite difficulty", options: ["Keep going", "Cut off", "Calm down", "Back out"], answer: "Keep going" },
      { prompt: "Understand finally", options: ["Figure out", "Drop by", "Set up", "Put off"], answer: "Figure out" },
      { prompt: "Stop functioning", options: ["Break down", "Pick up", "Look after", "Settle in"], answer: "Break down" },
    ];
  }, [selectedDeck]);

  const currentSprintQuestion = sprintQuestionPool[sprintRound] ?? sprintQuestionPool[0];

  const memoryPool = useMemo<MemoryPair[]>(() => {
    if (selectedDeck?.id === "business-english") {
      return [
        {
          pairId: "negotiate",
          word: "Negotiate",
          meaning: locale === "vi" ? "Thương lượng để đạt thỏa thuận" : "Reach an agreement by discussion",
        },
        {
          pairId: "delegate",
          word: "Delegate",
          meaning: locale === "vi" ? "Phân công nhiệm vụ" : "Assign tasks to others",
        },
        {
          pairId: "allocate",
          word: "Allocate",
          meaning: locale === "vi" ? "Phân bổ nguồn lực" : "Distribute resources",
        },
        {
          pairId: "deadline",
          word: "Deadline",
          meaning: locale === "vi" ? "Hạn chót hoàn thành" : "Final due date",
        },
        {
          pairId: "stakeholder",
          word: "Stakeholder",
          meaning: locale === "vi" ? "Bên liên quan của dự án" : "A party involved in a project",
        },
        {
          pairId: "brief",
          word: "Brief",
          meaning: locale === "vi" ? "Tóm tắt ngắn gọn" : "A concise summary",
        },
      ];
    }

    if (selectedDeck?.id === "toeic-core") {
      return [
        {
          pairId: "adaptable",
          word: "Adaptable",
          meaning: locale === "vi" ? "Có khả năng thích nghi" : "Able to adjust quickly",
        },
        {
          pairId: "accomplish",
          word: "Accomplish",
          meaning: locale === "vi" ? "Hoàn thành thành công" : "Complete successfully",
        },
        {
          pairId: "reliable",
          word: "Reliable",
          meaning: locale === "vi" ? "Đáng tin cậy" : "Can be trusted",
        },
        {
          pairId: "efficient",
          word: "Efficient",
          meaning: locale === "vi" ? "Hiệu quả, tiết kiệm" : "Working well without waste",
        },
        {
          pairId: "schedule",
          word: "Schedule",
          meaning: locale === "vi" ? "Lịch trình công việc" : "Planned timetable",
        },
      ];
    }

    return [
      {
        pairId: "adaptable",
        word: "Adaptable",
        meaning: locale === "vi" ? "Có khả năng thích nghi" : "Able to adjust quickly",
      },
      {
        pairId: "accomplish",
        word: "Accomplish",
        meaning: locale === "vi" ? "Hoàn thành thành công" : "Complete successfully",
      },
      {
        pairId: "hang-out",
        word: "Hang out",
        meaning: locale === "vi" ? "Đi chơi, thư giãn cùng bạn" : "Spend relaxed time with friends",
      },
      {
        pairId: "keep-going",
        word: "Keep going",
        meaning: locale === "vi" ? "Tiếp tục dù khó khăn" : "Continue despite difficulty",
      },
      {
        pairId: "take-off",
        word: "Take off",
        meaning: locale === "vi" ? "Rời đi nhanh" : "Leave quickly",
      },
    ];
  }, [locale, selectedDeck]);

  const memoryDeckConfig = useMemo<MemoryDeckConfig>(() => {
    if (selectedDeck?.id === "business-english") {
      return {
        pairCount: 6,
        timeSeconds: 70,
        recommendedDifficulty: "hard",
      };
    }

    if (selectedDeck?.id === "toeic-core") {
      return {
        pairCount: 5,
        timeSeconds: 80,
        recommendedDifficulty: "medium",
      };
    }

    return {
      pairCount: 4,
      timeSeconds: 90,
      recommendedDifficulty: "easy",
    };
  }, [selectedDeck]);

  const memoryPairs = useMemo(
    () => memoryPool.slice(0, memoryDeckConfig.pairCount),
    [memoryDeckConfig.pairCount, memoryPool],
  );

  const totalMemoryPairs = memoryPairs.length;
  const optimalMemoryMoves = totalMemoryPairs;

  const calculateMemoryFlipScore = useCallback(
    (matchedPairs: number, totalPairs: number, moves: number) => {
      const safeTotal = Math.max(1, totalPairs);
      const completionRatio = matchedPairs / safeTotal;
      const overflowMoves = Math.max(0, moves - safeTotal);
      const score = Math.round(completionRatio * 70 + Math.max(0, 30 - overflowMoves * 6));
      return Math.max(20, Math.min(100, score));
    },
    [],
  );

  const initializeMemoryFlip = useCallback(() => {
    const cards = shuffleArray(
      memoryPairs.flatMap((pair) => [
        {
          id: `${pair.pairId}-word`,
          pairId: pair.pairId,
          label: pair.word,
          matched: false,
        },
        {
          id: `${pair.pairId}-meaning`,
          pairId: pair.pairId,
          label: pair.meaning,
          matched: false,
        },
      ]),
    );

    setMemoryDeck(cards);
    setMemoryOpenIds([]);
    setMemoryMatchedPairs(0);
    setMemoryMoves(0);
    setMemoryLocked(false);
    setMemoryTimeLeft(memoryDeckConfig.timeSeconds);
    setMemoryFinished(false);
  }, [memoryDeckConfig.timeSeconds, memoryPairs]);

  const speakListeningPrompt = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error(t("games.listeningNotSupported"));
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(challengeWord.answer);
      utterance.lang = listeningVoiceLocale;
      utterance.rate = difficulty === "easy" ? 0.8 : difficulty === "hard" ? 1.05 : 0.92;
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(listeningVoiceLocale.toLowerCase()),
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      toast.error(t("games.listeningAudioError"));
    }
  }, [challengeWord.answer, difficulty, listeningVoiceLocale, t]);

  const saveGameResult = useCallback((scorePercent: number, gameType: DemoGameType) => {
    const wasCompleted = Boolean(demoState.dailyChallenge.completedAt);
    const next = recordGameResult({
      scorePercent,
      points: Math.max(
        10,
        Math.round((scorePercent / 100) * 45 * difficultyPointMultiplier[difficulty]),
      ),
      perfect: scorePercent === 100,
      gameType,
    });
    setDemoState(next);

    if (!wasCompleted && next.dailyChallenge.completedAt) {
      toast.success(
        t("games.dailyChallengeRewardToast").replace(
          "{points}",
          String(next.dailyChallenge.rewardPoints),
        ),
      );
    }
  }, [demoState.dailyChallenge.completedAt, difficulty, t]);

  useEffect(() => {
    if (activeTab !== "sprint" || sprintTimeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSprintTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTab, sprintTimeLeft]);

  useEffect(() => {
    if (activeTab !== "listening") {
      return;
    }

    speakListeningPrompt();
  }, [activeTab, speakListeningPrompt]);

  useEffect(() => {
    if (activeTab !== "memoryFlip" || memoryFinished || memoryTimeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMemoryTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [activeTab, memoryFinished, memoryTimeLeft]);

  useEffect(() => {
    if (
      activeTab !== "memoryFlip" ||
      memoryFinished ||
      memoryTimeLeft > 0 ||
      totalMemoryPairs === 0
    ) {
      return;
    }

    const frame = window.setTimeout(() => {
      const score = calculateMemoryFlipScore(memoryMatchedPairs, totalMemoryPairs, memoryMoves);
      saveGameResult(score, "memoryFlip");
      setMemoryFinished(true);
      toast.warning(t("games.memoryFlipTimeout"));
    }, 0);

    return () => window.clearTimeout(frame);
  }, [
    activeTab,
    calculateMemoryFlipScore,
    memoryFinished,
    memoryMatchedPairs,
    memoryMoves,
    memoryTimeLeft,
    saveGameResult,
    t,
    totalMemoryPairs,
  ]);

  const handleMemoryCardClick = useCallback(
    (cardId: string) => {
      if (activeTab !== "memoryFlip" || memoryLocked) {
        return;
      }

      const clickedCard = memoryDeck.find((card) => card.id === cardId);
      if (!clickedCard || clickedCard.matched || memoryOpenIds.includes(cardId)) {
        return;
      }

      if (memoryOpenIds.length === 0) {
        setMemoryOpenIds([cardId]);
        return;
      }

      const firstCard = memoryDeck.find((card) => card.id === memoryOpenIds[0]);
      if (!firstCard) {
        setMemoryOpenIds([cardId]);
        return;
      }

      const nextOpen = [memoryOpenIds[0], cardId];
      setMemoryOpenIds(nextOpen);
      const nextMoves = memoryMoves + 1;
      setMemoryMoves(nextMoves);

      if (firstCard.pairId === clickedCard.pairId) {
        setMemoryDeck((prev) =>
          prev.map((card) =>
            card.pairId === clickedCard.pairId ? { ...card, matched: true } : card,
          ),
        );
        setMemoryOpenIds([]);
        setMemoryMatchedPairs((prev) => {
          const nextMatched = prev + 1;
          if (nextMatched === totalMemoryPairs) {
            const score = calculateMemoryFlipScore(nextMatched, totalMemoryPairs, nextMoves);
            saveGameResult(score, "memoryFlip");
            setMemoryFinished(true);
            toast.success(t("games.memoryFlipCompleted"));
          }
          return nextMatched;
        });
        return;
      }

      setMemoryLocked(true);
      window.setTimeout(() => {
        setMemoryOpenIds([]);
        setMemoryLocked(false);
      }, 750);
    },
    [
      activeTab,
      calculateMemoryFlipScore,
      memoryDeck,
      memoryLocked,
      memoryMoves,
      memoryOpenIds,
      saveGameResult,
      t,
      totalMemoryPairs,
    ],
  );

  const resetMiniGameState = () => {
    setMatchingAnswer("");
    setMultipleAnswer("");
    setMultipleSubmitted(false);
    setTypedAnswer("");
    setTypingSubmitted(false);
    setBuiltWord("");
    setBuilderSubmitted(false);
    setMemoryDeck([]);
    setMemoryOpenIds([]);
    setMemoryMatchedPairs(0);
    setMemoryMoves(0);
    setMemoryLocked(false);
    setMemoryTimeLeft(0);
    setMemoryFinished(false);
    setSprintRound(0);
    setSprintScore(0);
    setSprintTimeLeft(30);
    setListeningAnswer("");
    setListeningSubmitted(false);
    setListeningReplay(0);
    setListeningVoiceLocale(locale === "en" ? "en-GB" : "en-US");
  };

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
                  onClick={() => {
                    resetMiniGameState();
                    setActiveTab(game.id);
                    if (game.id === "memoryFlip") {
                      initializeMemoryFlip();
                    }
                  }}
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
                  <p className="text-2xl font-bold">{demoState.gameStats.gamesPlayed}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.gamesPlayed")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.averageScore")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.perfectScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.perfectScore")}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.pointsEarned}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.pointsEarned")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>{t("games.gameSessionSetup")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="deck" className="text-sm font-medium">
                      {t("games.deck")}
                    </label>
                    <select
                      id="deck"
                      value={selectedDeckId}
                      onChange={(event) => setSelectedDeckId(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {demoState.decks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-sm font-medium">
                      {t("games.difficulty")}
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="easy">{t("games.difficultyEasy")}</option>
                      <option value="medium">{t("games.difficultyMedium")}</option>
                      <option value="hard">{t("games.difficultyHard")}</option>
                    </select>
                  </div>

                  <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                    {t("games.difficultyBonusPrefix")}: x{difficultyPointMultiplier[difficulty]}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("games.dailyChallenge")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium">
                    {locale === "vi"
                      ? demoState.dailyChallenge.titleVi
                      : demoState.dailyChallenge.titleEn}
                  </p>
                  <div className="rounded-md bg-muted p-3">
                    <p>
                      {t("games.target")}: {demoState.dailyChallenge.targetScore}%
                    </p>
                    <p>
                      {t("games.reward")}: +{demoState.dailyChallenge.rewardPoints}
                    </p>
                    <p>
                      {t("games.endsIn")}: {countdownLabel}
                    </p>
                  </div>
                  <div className="rounded-md border border-dashed p-3">
                    {demoState.dailyChallenge.completedAt
                      ? t("games.completedToday")
                      : t("games.notCompletedYet")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>{t("games.leaderboard")}</CardTitle>
                  <select
                    value={leaderboardRange}
                    onChange={(event) => setLeaderboardRange(event.target.value as LeaderboardRange)}
                    aria-label={t("games.leaderboardFilterAria")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="weekly">{t("games.leaderboardWeekly")}</option>
                    <option value="monthly">{t("games.leaderboardMonthly")}</option>
                    <option value="all">{t("games.leaderboardAllTime")}</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between rounded-md border p-3 text-sm ${
                      entry.id === "you" ? "border-primary/40 bg-primary/5" : "border-border"
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        #{index + 1} {entry.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.gamesPlayed} {t("games.gamesUnit")} • {entry.streakDays} {t("games.streakDaysUnit")}
                      </p>
                    </div>
                    <p className="font-semibold">{entry.viewPoints}</p>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">
                  {t("games.yourRank")}: #{Math.max(1, playerRank)}
                </p>
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
                {t("games.matchingInstruction")}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("games.currentDeck")}: {selectedDeck?.name ?? "-"}
              </p>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {[
                  "Can adjust quickly",
                  "Always confusing",
                  "Impossible to change",
                  "Very uncomfortable",
                ].map((option) => (
                  <Button
                    key={option}
                    variant={matchingAnswer === option ? "default" : "outline"}
                    type="button"
                    onClick={() => setMatchingAnswer(option)}
                    className="justify-start"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="mb-4 flex gap-2">
                <Button
                  type="button"
                  disabled={!matchingAnswer}
                  onClick={() => {
                    const score = matchingAnswer === "Can adjust quickly" ? 100 : 0;
                    saveGameResult(score, "matching");
                    toast.success(
                      score === 100
                        ? t("games.answerCorrect")
                        : t("games.answerTryAgain"),
                    );
                    setActiveTab("selection");
                  }}
                >
                  {t("games.submitAnswer")}
                </Button>
              </div>
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
              <p className="rounded-md bg-muted p-4 text-center">{promptText}</p>
              {[
                challengeWord.answer,
                "Abundant",
                "Awkward",
                "Abstract",
              ].map(
                (option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="w-full justify-start"
                    type="button"
                    onClick={() => setMultipleAnswer(option)}
                  >
                    {option}
                  </Button>
                ),
              )}
              {multipleSubmitted && (
                <p className="text-sm text-muted-foreground">
                  {multipleAnswer === challengeWord.answer
                    ? t("games.multipleRight")
                    : `${t("games.multipleCorrectAnswerPrefix")} ${challengeWord.answer}`}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                >
                  {t("games.backToGames")}
                </Button>
                <Button
                  type="button"
                  disabled={!multipleAnswer}
                  onClick={() => {
                    setMultipleSubmitted(true);
                    const score = multipleAnswer === challengeWord.answer ? 100 : 50;
                    saveGameResult(score, "multiple");
                    toast.success(t("games.resultSaved"));
                    setActiveTab("selection");
                  }}
                >
                  {t("games.nextQuestion")}
                </Button>
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
              <p className="rounded-md bg-muted p-4 text-center">{promptText}</p>
              <input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-2"
                placeholder={t("games.typingPlaceholder")}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                >
                  {t("games.backToGames")}
                </Button>
                <Button
                  disabled={!typedAnswer}
                  type="button"
                  onClick={() => {
                    setTypingSubmitted(true);
                    const score =
                      typedAnswer.trim().toLowerCase() === challengeWord.answer.toLowerCase()
                        ? 100
                        : 40;
                    saveGameResult(score, "typing");
                    toast.success(t("games.answerSubmitted"));
                    setActiveTab("selection");
                  }}
                >
                  {t("games.submitAnswer")}
                </Button>
              </div>
              {typingSubmitted && (
                <p className="text-sm text-muted-foreground">
                  {t("games.typingResultRecorded")}
                </p>
              )}
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
                {t("games.builderInstruction")}
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
                <Button
                  type="button"
                  onClick={() => {
                    setBuilderSubmitted(true);
                    const target = challengeWord.answer.toUpperCase().replaceAll(" ", "");
                    const score = builtWord === target ? 100 : 35;
                    saveGameResult(score, "builder");
                    toast.success(t("games.answerSubmitted"));
                    setActiveTab("selection");
                  }}
                  disabled={builtWord.length === 0}
                >
                  {t("games.submitAnswer")}
                </Button>
              </div>
              {builderSubmitted && (
                <p className="text-sm text-muted-foreground">
                  {t("games.builderResultRecorded")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "memoryFlip" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.memoryFlip")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("games.memoryFlipInstruction")}</p>
              <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">{t("games.memoryTimeLeft")}</p>
                  <p className="text-lg font-semibold">{memoryTimeLeft}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.memoryMoves")}</p>
                  <p className="text-lg font-semibold">{memoryMoves}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.memoryOptimalMoves")}</p>
                  <p className="text-lg font-semibold">{optimalMemoryMoves}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.memoryMatchedPairs")}</p>
                  <p className="text-lg font-semibold">
                    {memoryMatchedPairs}/{totalMemoryPairs}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.currentDeck")}</p>
                  <p className="text-sm font-semibold">{selectedDeck?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.memoryDeckDifficulty")}</p>
                  <p className="text-sm font-semibold">
                    {t(`games.difficulty${
                      memoryDeckConfig.recommendedDifficulty.charAt(0).toUpperCase() +
                      memoryDeckConfig.recommendedDifficulty.slice(1)
                    }`)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {memoryDeck.map((card) => {
                  const isOpen = memoryOpenIds.includes(card.id) || card.matched;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleMemoryCardClick(card.id)}
                      disabled={card.matched || memoryLocked || memoryFinished || memoryTimeLeft === 0}
                      className={`h-24 rounded-md border px-3 py-2 text-sm font-medium transition ${
                        isOpen
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {isOpen ? card.label : "?"}
                    </button>
                  );
                })}
              </div>

              {memoryMatchedPairs === totalMemoryPairs && (
                <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
                  {t("games.memoryFlipCompleted")}
                </p>
              )}

              {memoryTimeLeft === 0 && memoryMatchedPairs < totalMemoryPairs && (
                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-foreground">
                  {t("games.memoryFlipTimeout")}
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab("selection")}>
                  {t("games.backToGames")}
                </Button>
                <Button type="button" variant="outline" onClick={initializeMemoryFlip}>
                  {t("games.reset")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "sprint" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.sprintModeTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("games.sprintTimeLeft")}</p>
                  <p className="text-lg font-semibold">{sprintTimeLeft}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.sprintCorrect")}</p>
                  <p className="text-lg font-semibold">{sprintScore}/{Math.max(1, sprintRound)}</p>
                </div>
              </div>

              <Progress value={Math.min(100, Math.round((sprintRound / sprintQuestionPool.length) * 100))} />

              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">
                  {t("games.sprintQuestion")} {Math.min(sprintRound + 1, sprintQuestionPool.length)}/{sprintQuestionPool.length}
                </p>
                <p className="mt-2 font-medium">{currentSprintQuestion.prompt}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {currentSprintQuestion.options.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="justify-start"
                    disabled={sprintTimeLeft <= 0}
                    onClick={() => {
                      const isCorrect = option === currentSprintQuestion.answer;
                      if (isCorrect) {
                        setSprintScore((prev) => prev + 1);
                      }

                      if (sprintRound + 1 >= sprintQuestionPool.length) {
                        const finalCorrect = sprintScore + (isCorrect ? 1 : 0);
                        const score = Math.round((finalCorrect / sprintQuestionPool.length) * 100);
                        saveGameResult(score, "sprint");
                        toast.success(t("games.sprintCompleted"));
                        setActiveTab("selection");
                        return;
                      }

                      setSprintRound((prev) => prev + 1);
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {sprintTimeLeft <= 0 && (
                <Button
                  type="button"
                  onClick={() => {
                    const totalRounds = Math.max(1, sprintRound);
                    const score = Math.round((sprintScore / totalRounds) * 100);
                    saveGameResult(score, "sprint");
                    toast.success(t("games.sprintFinished"));
                    setActiveTab("selection");
                  }}
                >
                  {t("games.sprintFinished")}
                </Button>
              )}

              <Button variant="outline" onClick={() => setActiveTab("selection")}>{t("games.backToGames")}</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "listening" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("games.listeningModeTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="text-muted-foreground">{t("games.listeningKeyPhrase")}</p>
                <p className="mt-1 font-semibold">{challengeWord.answer}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="listening-voice" className="text-sm font-medium">
                  {t("games.voiceLocale")}
                </label>
                <select
                  id="listening-voice"
                  value={listeningVoiceLocale}
                  onChange={(event) => setListeningVoiceLocale(event.target.value as ListeningVoiceLocale)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="en-US">{t("games.voiceEnUs")}</option>
                  <option value="en-GB">{t("games.voiceEnGb")}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setListeningReplay((prev) => prev + 1);
                    speakListeningPrompt();
                  }}
                >
                  {t("games.listeningReplay")} ({listeningReplay})
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("selection")}>{t("games.backToGames")}</Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {t("games.listeningInstruction")}
              </p>

              {listeningOptions.map((option) => (
                <Button
                  key={option}
                  variant={listeningAnswer === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setListeningAnswer(option)}
                >
                  {option}
                </Button>
              ))}

              <Button
                type="button"
                disabled={!listeningAnswer}
                onClick={() => {
                  setListeningSubmitted(true);
                  const expectedAnswer = locale === "vi" ? challengeWord.viPrompt : challengeWord.enPrompt;
                  const isCorrect = listeningAnswer === expectedAnswer;
                  const score = isCorrect ? 100 : 45;
                  saveGameResult(score, "listening");
                  toast.success(t("games.listeningSubmitted"));
                  setActiveTab("selection");
                }}
              >
                {t("games.submitAnswer")}
              </Button>

              {listeningSubmitted && (
                <p className="text-sm text-muted-foreground">
                  {t("games.listeningResultRecorded")}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
