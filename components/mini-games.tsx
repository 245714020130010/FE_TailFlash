"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import {
  Award,
  Brain,
  Crosshair,
  Flame,
  Gamepad2,
  Headphones,
  Keyboard,
  Layers3,
  Sparkles,
  Swords,
  Timer,
  Trophy,
} from "lucide-react";
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
  | "listening"
  | "speedSpelling";
type Difficulty = "easy" | "medium" | "hard";
type LeaderboardRange = "weekly" | "monthly" | "all";
type ListeningVoiceLocale = "en-US" | "en-GB";

type GameTile = {
  id: Exclude<GameTab, "selection">;
  icon: ReactNode;
  title: string;
  duration: string;
  paceLabel: string;
  accentClass: string;
};

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

type ChoiceQuestion = {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
};

type TypingQuestion = {
  id: string;
  prompt: string;
  answer: string;
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
  const [activeTab, setActiveTabState] = useState<GameTab>("selection");
  const [displayedTab, setDisplayedTab] = useState<GameTab>("selection");
  const [pendingTab, setPendingTab] = useState<GameTab | null>(null);
  const [tabTransitionStage, setTabTransitionStage] = useState<"idle" | "exiting" | "entering">("idle");
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
  const [matchingRound, setMatchingRound] = useState(0);
  const [matchingCorrect, setMatchingCorrect] = useState(0);
  const [multipleAnswer, setMultipleAnswer] = useState("");
  const [multipleSubmitted, setMultipleSubmitted] = useState(false);
  const [multipleRound, setMultipleRound] = useState(0);
  const [multipleCorrect, setMultipleCorrect] = useState(0);
  const [typingSubmitted, setTypingSubmitted] = useState(false);
  const [typingRound, setTypingRound] = useState(0);
  const [typingCorrect, setTypingCorrect] = useState(0);
  const [builderSubmitted, setBuilderSubmitted] = useState(false);
  const [sprintRound, setSprintRound] = useState(0);
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(30);
  const [speedRound, setSpeedRound] = useState(0);
  const [speedInput, setSpeedInput] = useState("");
  const [speedScore, setSpeedScore] = useState(0);
  const [speedCombo, setSpeedCombo] = useState(0);
  const [speedBestCombo, setSpeedBestCombo] = useState(0);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(45);
  const [speedBonusTime, setSpeedBonusTime] = useState(0);
  const [feedbackSignal, setFeedbackSignal] = useState<"correct" | "wrong" | null>(null);
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
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [roundPulse, setRoundPulse] = useState(false);
  const { locale, t } = useLanguage();

  const setActiveTab = useCallback(
    (nextTab: GameTab) => {
      if (nextTab === activeTab || nextTab === pendingTab) {
        return;
      }

      setPendingTab(nextTab);
      setTabTransitionStage("exiting");
    },
    [activeTab, pendingTab],
  );

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

  useEffect(() => {
    if (activeTab !== "selection") {
      return;
    }

    let showFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      setSelectionVisible(false);
      showFrame = window.requestAnimationFrame(() => {
        setSelectionVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(showFrame);
    };
  }, [activeTab]);

  useEffect(() => {
    if (tabTransitionStage !== "exiting" || !pendingTab) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveTabState(pendingTab);
      setDisplayedTab(pendingTab);
      setTabTransitionStage("entering");
    }, 110);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pendingTab, tabTransitionStage]);

  useEffect(() => {
    if (tabTransitionStage !== "entering") {
      return;
    }

    const timer = window.setTimeout(() => {
      setTabTransitionStage("idle");
      setPendingTab(null);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [tabTransitionStage]);

  const games = useMemo<GameTile[]>(
    () => [
      {
        id: "matching",
        icon: <Crosshair className="h-6 w-6" aria-hidden="true" />,
        title: t("games.matching"),
        duration: "5-10m",
        paceLabel: locale === "vi" ? "Nhịp ổn định" : "Steady pace",
        accentClass: "from-cyan-500/20 via-sky-500/10 to-transparent",
      },
      {
        id: "multiple",
        icon: <Swords className="h-6 w-6" aria-hidden="true" />,
        title: t("games.multipleChoice"),
        duration: "8-12m",
        paceLabel: locale === "vi" ? "Nhịp chiến thuật" : "Tactical pace",
        accentClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
      },
      {
        id: "typing",
        icon: <Keyboard className="h-6 w-6" aria-hidden="true" />,
        title: t("games.typing"),
        duration: "10-15m",
        paceLabel: locale === "vi" ? "Nhịp chính xác" : "Precision pace",
        accentClass: "from-emerald-500/20 via-teal-500/10 to-transparent",
      },
      {
        id: "builder",
        icon: <Layers3 className="h-6 w-6" aria-hidden="true" />,
        title: t("games.builder"),
        duration: "10-15m",
        paceLabel: locale === "vi" ? "Nhịp tư duy" : "Logic pace",
        accentClass: "from-orange-500/20 via-amber-500/10 to-transparent",
      },
      {
        id: "memoryFlip",
        icon: <Brain className="h-6 w-6" aria-hidden="true" />,
        title: t("games.memoryFlip"),
        duration: "6-10m",
        paceLabel: locale === "vi" ? "Nhịp ghi nhớ" : "Recall pace",
        accentClass: "from-fuchsia-500/20 via-pink-500/10 to-transparent",
      },
      {
        id: "sprint",
        icon: <Timer className="h-6 w-6" aria-hidden="true" />,
        title: t("games.sprint"),
        duration: "3-5m",
        paceLabel: locale === "vi" ? "Nhịp siêu nhanh" : "High speed",
        accentClass: "from-red-500/20 via-orange-500/10 to-transparent",
      },
      {
        id: "listening",
        icon: <Headphones className="h-6 w-6" aria-hidden="true" />,
        title: t("games.listening"),
        duration: "5-8m",
        paceLabel: locale === "vi" ? "Nhịp phản xạ" : "Reactive pace",
        accentClass: "from-violet-500/20 via-indigo-500/10 to-transparent",
      },
      {
        id: "speedSpelling",
        icon: <Flame className="h-6 w-6" aria-hidden="true" />,
        title: t("games.speedSpelling"),
        duration: "2-4m",
        paceLabel: locale === "vi" ? "Nhịp cực đại" : "Max intensity",
        accentClass: "from-rose-500/20 via-red-500/10 to-transparent",
      },
    ],
    [locale, t],
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

  const matchingQuestions = useMemo<ChoiceQuestion[]>(() => {
    const maxQuestions = Math.min(4, memoryPool.length);
    return shuffleArray(memoryPool)
      .slice(0, maxQuestions)
      .map((pair) => {
        const distractors = shuffleArray(
          memoryPool
            .filter((candidate) => candidate.pairId !== pair.pairId)
            .map((candidate) => candidate.meaning),
        ).slice(0, 3);

        return {
          id: pair.pairId,
          prompt: pair.word,
          answer: pair.meaning,
          options: shuffleArray([pair.meaning, ...distractors]),
        };
      });
  }, [memoryPool]);

  const multipleQuestions = useMemo<ChoiceQuestion[]>(() => {
    const maxQuestions = Math.min(4, memoryPool.length);
    return shuffleArray(memoryPool)
      .slice(0, maxQuestions)
      .map((pair) => {
        const distractors = shuffleArray(
          memoryPool
            .filter((candidate) => candidate.pairId !== pair.pairId)
            .map((candidate) => candidate.word),
        ).slice(0, 3);

        return {
          id: pair.pairId,
          prompt: pair.meaning,
          answer: pair.word,
          options: shuffleArray([pair.word, ...distractors]),
        };
      });
  }, [memoryPool]);

  const typingQuestions = useMemo<TypingQuestion[]>(() => {
    const maxQuestions = Math.min(4, memoryPool.length);
    return shuffleArray(memoryPool)
      .slice(0, maxQuestions)
      .map((pair) => ({
        id: pair.pairId,
        prompt: pair.meaning,
        answer: pair.word,
      }));
  }, [memoryPool]);

  const speedChallenges = useMemo<TypingQuestion[]>(() => {
    const maxQuestions = Math.min(8, memoryPool.length * 2);
    const loopedPool = Array.from({ length: Math.ceil(maxQuestions / memoryPool.length) })
      .flatMap(() => shuffleArray(memoryPool))
      .slice(0, maxQuestions);

    return loopedPool.map((pair, index) => ({
      id: `${pair.pairId}-${index}`,
      prompt: pair.meaning,
      answer: pair.word,
    }));
  }, [memoryPool]);

  const currentMatchingQuestion =
    matchingQuestions[matchingRound] ?? matchingQuestions[0] ?? null;
  const currentMultipleQuestion =
    multipleQuestions[multipleRound] ?? multipleQuestions[0] ?? null;
  const currentTypingQuestion = typingQuestions[typingRound] ?? typingQuestions[0] ?? null;
  const currentSpeedChallenge = speedChallenges[speedRound] ?? speedChallenges[0] ?? null;

  const feedbackCardClass =
    feedbackSignal === "correct"
      ? "ring-2 ring-emerald-400/50 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
      : feedbackSignal === "wrong"
        ? "ring-2 ring-rose-400/50 shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
        : "";
  const interactiveCardClass = `border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:shadow-md ${feedbackCardClass}`;

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

  const playFeedbackTone = useCallback((signal: "correct" | "wrong") => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    try {
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = signal === "correct" ? 880 : 220;
      gainNode.gain.setValueAtTime(0.0001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);

      void context.close();
    } catch {
      // Keep silent if audio context cannot be created.
    }
  }, []);

  const triggerFeedback = useCallback((isCorrect: boolean) => {
    const signal = isCorrect ? "correct" : "wrong";
    setFeedbackSignal(signal);
    playFeedbackTone(signal);
    window.setTimeout(() => {
      setFeedbackSignal(null);
    }, 280);
  }, [playFeedbackTone]);

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
    if (activeTab !== "speedSpelling" || speedTimeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSpeedTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTab, speedTimeLeft]);

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

  useEffect(() => {
    if (activeTab !== "speedSpelling" || speedTimeLeft > 0 || speedChallenges.length === 0) {
      return;
    }

    const frame = window.setTimeout(() => {
      const total = Math.max(1, speedChallenges.length);
      const maxExpectedScore = total * 20;
      const scorePercent = Math.max(
        0,
        Math.min(100, Math.round((speedScore / maxExpectedScore) * 100)),
      );
      saveGameResult(scorePercent, "speedSpelling");
      toast.warning(
        `${t("games.speedTimeout")} - ${t("games.speedScoreLabel")}: ${speedScore}`,
      );
      setActiveTab("selection");
    }, 0);

    return () => window.clearTimeout(frame);
  }, [activeTab, saveGameResult, setActiveTab, speedChallenges.length, speedScore, speedTimeLeft, t]);

  useEffect(() => {
    if (activeTab === "selection") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setRoundPulse(true);
    });
    const timer = window.setTimeout(() => {
      setRoundPulse(false);
    }, 260);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [
    activeTab,
    matchingRound,
    multipleRound,
    typingRound,
    sprintRound,
    speedRound,
    memoryMatchedPairs,
    listeningReplay,
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
    setMatchingRound(0);
    setMatchingCorrect(0);
    setMultipleAnswer("");
    setMultipleSubmitted(false);
    setMultipleRound(0);
    setMultipleCorrect(0);
    setTypedAnswer("");
    setTypingSubmitted(false);
    setTypingRound(0);
    setTypingCorrect(0);
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
    setSpeedRound(0);
    setSpeedInput("");
    setSpeedScore(0);
    setSpeedCombo(0);
    setSpeedBestCombo(0);
    setSpeedTimeLeft(45);
    setSpeedBonusTime(0);
    setFeedbackSignal(null);
    setListeningAnswer("");
    setListeningSubmitted(false);
    setListeningReplay(0);
    setListeningVoiceLocale(locale === "en" ? "en-GB" : "en-US");
  };

  const roundSurfaceClass = `rounded-lg border border-border/70 bg-muted/60 p-3 text-sm transition-all duration-300 ${
    roundPulse ? "scale-[1.01] border-primary/40 shadow-[0_10px_25px_-18px_rgba(59,130,246,0.55)]" : ""
  }`;
  const urgentPulseClass =
    (activeTab === "memoryFlip" && memoryTimeLeft > 0 && memoryTimeLeft <= 10) ||
    (activeTab === "sprint" && sprintTimeLeft > 0 && sprintTimeLeft <= 6) ||
    (activeTab === "speedSpelling" && speedTimeLeft > 0 && speedTimeLeft <= 8)
      ? "animate-pulse text-rose-500"
      : "";

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
        <div
          className={`transition-all duration-200 ${
            tabTransitionStage === "exiting" ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
        {displayedTab === "selection" && (
          <>
            <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-sky-500/10 via-background to-emerald-500/10 p-6 shadow-sm">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                    <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {locale === "vi" ? "Mini game lab" : "Mini game lab"}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {locale === "vi"
                      ? "Bản đồ game luyện phản xạ và ghi nhớ"
                      : "Game map for reflex and recall"}
                  </h2>
                  <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                    {locale === "vi"
                      ? "Chọn game theo nhịp học của bạn, tích điểm theo độ khó và theo dõi tiến bộ trong cùng một màn hình."
                      : "Pick a game by your learning pace, earn points by difficulty, and track progress in one flow."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">{t("games.gamesPlayed")}</p>
                    <p className="mt-1 text-xl font-semibold">{demoState.gameStats.gamesPlayed}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">{t("games.averageScore")}</p>
                    <p className="mt-1 text-xl font-semibold">{demoState.gameStats.averageScore}%</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">{t("games.perfectScore")}</p>
                    <p className="mt-1 text-xl font-semibold">{demoState.gameStats.perfectScore}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">{t("games.pointsEarned")}</p>
                    <p className="mt-1 text-xl font-semibold">{demoState.gameStats.pointsEarned}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {games.map((game, index) => (
                <Card
                  key={game.id}
                  className={`group relative cursor-pointer overflow-hidden border-border/70 bg-card/90 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                    selectionVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 55}ms` }}
                  onClick={() => {
                    resetMiniGameState();
                    setActiveTab(game.id);
                    if (game.id === "memoryFlip") {
                      initializeMemoryFlip();
                    }
                  }}
                >
                  <CardContent className="relative z-10 pt-6">
                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${game.accentClass}`} />
                    <div className="mb-3 flex items-center justify-between">
                      <div className="relative rounded-xl border border-border/70 bg-background/90 p-2.5 text-primary shadow-sm">
                        {game.icon}
                      </div>
                      <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
                        {game.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{game.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{game.paceLabel}</p>
                    <Button className="mt-4 w-full transition group-hover:translate-y-0" variant="outline">
                      {t("games.play")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8 border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  {t("games.yourStats")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-muted/60 p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.gamesPlayed}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.gamesPlayed")}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/60 p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.averageScore")}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/60 p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.perfectScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.perfectScore")}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/60 p-3 text-center">
                  <p className="text-2xl font-bold">{demoState.gameStats.pointsEarned}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("games.pointsEarned")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-500" aria-hidden="true" />
                    {t("games.gameSessionSetup")}
                  </CardTitle>
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

                  <div className="rounded-lg border border-dashed bg-muted/50 p-3 text-sm text-muted-foreground">
                    {t("games.difficultyBonusPrefix")}: x{difficultyPointMultiplier[difficulty]}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    {t("games.dailyChallenge")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium">
                    {locale === "vi"
                      ? demoState.dailyChallenge.titleVi
                      : demoState.dailyChallenge.titleEn}
                  </p>
                  <div className="rounded-lg border border-border/70 bg-muted/60 p-3">
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
                  <div className="rounded-lg border border-dashed border-border/70 p-3">
                    {demoState.dailyChallenge.completedAt
                      ? t("games.completedToday")
                      : t("games.notCompletedYet")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-sky-500" aria-hidden="true" />
                    {t("games.leaderboard")}
                  </CardTitle>
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
                    className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                      entry.id === "you" ? "border-primary/40 bg-primary/10" : "border-border/70 bg-background/60"
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

        {displayedTab === "matching" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                {t("games.matching")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <Progress
                value={
                  matchingQuestions.length > 0
                    ? Math.round((matchingRound / matchingQuestions.length) * 100)
                    : 0
                }
                className="mb-4"
              />
              <p className="mb-4 text-sm text-muted-foreground">
                {t("games.matchingInstruction")}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("games.currentDeck")}: {selectedDeck?.name ?? "-"}
              </p>
              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3`}>
                <p>
                  {t("games.roundLabel")}: {Math.min(matchingRound + 1, Math.max(1, matchingQuestions.length))}/{Math.max(1, matchingQuestions.length)}
                </p>
                <p>
                  {t("games.correctCount")}: {matchingCorrect}
                </p>
              </div>
              <p className={`mb-3 rounded-lg border border-border/70 bg-background/80 p-3 text-sm font-medium transition-all duration-300 ${roundPulse ? "translate-x-0.5" : ""}`}>
                {currentMatchingQuestion?.prompt}
              </p>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {(currentMatchingQuestion?.options ?? []).map((option, index) => (
                  <Button
                    key={option}
                    variant={matchingAnswer === option ? "default" : "outline"}
                    type="button"
                    onClick={() => setMatchingAnswer(option)}
                    className={`justify-start border-border/70 bg-background/80 transition-all duration-300 ${
                      roundPulse ? "translate-y-0 opacity-100" : ""
                    }`}
                    style={{ transitionDelay: `${index * 45}ms` }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="mb-4 flex gap-2">
                <Button
                  type="button"
                  disabled={!matchingAnswer || !currentMatchingQuestion}
                  onClick={() => {
                    if (!currentMatchingQuestion) {
                      return;
                    }

                    const isCorrect = matchingAnswer === currentMatchingQuestion.answer;
                    const nextCorrect = matchingCorrect + (isCorrect ? 1 : 0);
                    const isLastQuestion = matchingRound + 1 >= matchingQuestions.length;

                    triggerFeedback(isCorrect);
                    toast.success(isCorrect ? t("games.answerCorrect") : t("games.answerTryAgain"));

                    if (isLastQuestion) {
                      const total = Math.max(1, matchingQuestions.length);
                      const score = Math.round((nextCorrect / total) * 100);
                      saveGameResult(score, "matching");
                      toast.success(
                        t("games.sessionSummary")
                          .replace("{correct}", String(nextCorrect))
                          .replace("{total}", String(total)),
                      );
                      setActiveTab("selection");
                      return;
                    }

                    setMatchingCorrect(nextCorrect);
                    setMatchingRound((prev) => prev + 1);
                    setMatchingAnswer("");
                  }}
                >
                  {matchingRound + 1 >= matchingQuestions.length
                    ? t("games.submitAnswer")
                    : t("games.nextQuestion")}
                </Button>
              </div>
              <Button onClick={() => setActiveTab("selection")} variant="outline" className="border-border/70">
                {t("games.backToGames")}
              </Button>
            </CardContent>
          </Card>
        )}

        {displayedTab === "multiple" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                {t("games.multipleChoice")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <Progress
                value={
                  multipleQuestions.length > 0
                    ? Math.round((multipleRound / multipleQuestions.length) * 100)
                    : 0
                }
              />
              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3`}>
                <p>
                  {t("games.roundLabel")}: {Math.min(multipleRound + 1, Math.max(1, multipleQuestions.length))}/{Math.max(1, multipleQuestions.length)}
                </p>
                <p>
                  {t("games.correctCount")}: {multipleCorrect}
                </p>
              </div>
              <p className={`rounded-lg border border-border/70 bg-muted/60 p-4 text-center transition-all duration-300 ${roundPulse ? "translate-x-0.5" : ""}`}>{currentMultipleQuestion?.prompt ?? promptText}</p>
              {(currentMultipleQuestion?.options ?? []).map((option, index) => (
                <Button
                  key={option}
                  variant="outline"
                  className="w-full justify-start border-border/70 bg-background/80"
                  type="button"
                  onClick={() => setMultipleAnswer(option)}
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  {option}
                </Button>
              ))}
              {multipleSubmitted && (
                <p className="text-sm text-muted-foreground">
                  {multipleAnswer === currentMultipleQuestion?.answer
                    ? t("games.multipleRight")
                    : `${t("games.multipleCorrectAnswerPrefix")} ${currentMultipleQuestion?.answer ?? ""}`}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                  className="border-border/70"
                >
                  {t("games.backToGames")}
                </Button>
                <Button
                  type="button"
                  disabled={!multipleAnswer || !currentMultipleQuestion}
                  onClick={() => {
                    if (!currentMultipleQuestion) {
                      return;
                    }

                    setMultipleSubmitted(true);
                    const isCorrect = multipleAnswer === currentMultipleQuestion.answer;
                    const nextCorrect = multipleCorrect + (isCorrect ? 1 : 0);
                    const isLastQuestion = multipleRound + 1 >= multipleQuestions.length;

                    triggerFeedback(isCorrect);

                    if (isLastQuestion) {
                      const total = Math.max(1, multipleQuestions.length);
                      const score = Math.round((nextCorrect / total) * 100);
                      saveGameResult(score, "multiple");
                      toast.success(
                        t("games.sessionSummary")
                          .replace("{correct}", String(nextCorrect))
                          .replace("{total}", String(total)),
                      );
                      setActiveTab("selection");
                      return;
                    }

                    setMultipleCorrect(nextCorrect);
                    setMultipleRound((prev) => prev + 1);
                    setMultipleAnswer("");
                    setMultipleSubmitted(false);
                  }}
                >
                  {multipleRound + 1 >= multipleQuestions.length
                    ? t("games.submitAnswer")
                    : t("games.nextQuestion")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {displayedTab === "typing" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                {t("games.typing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <Progress
                value={
                  typingQuestions.length > 0
                    ? Math.round((typingRound / typingQuestions.length) * 100)
                    : 0
                }
              />
              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3`}>
                <p>
                  {t("games.roundLabel")}: {Math.min(typingRound + 1, Math.max(1, typingQuestions.length))}/{Math.max(1, typingQuestions.length)}
                </p>
                <p>
                  {t("games.correctCount")}: {typingCorrect}
                </p>
              </div>
              <p className={`rounded-lg border border-border/70 bg-muted/60 p-4 text-center transition-all duration-300 ${roundPulse ? "translate-x-0.5" : ""}`}>{currentTypingQuestion?.prompt ?? promptText}</p>
              {currentTypingQuestion && (
                <p className="text-xs text-muted-foreground">
                  {t("games.typingHint")
                    .replace("{letter}", currentTypingQuestion.answer.charAt(0).toUpperCase())
                    .replace("{length}", String(currentTypingQuestion.answer.replaceAll(" ", "").length))}
                </p>
              )}
              <input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className="w-full rounded-lg border border-border/70 bg-background/90 px-4 py-2"
                placeholder={t("games.typingPlaceholder")}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("selection")}
                  className="border-border/70"
                >
                  {t("games.backToGames")}
                </Button>
                <Button
                  disabled={!typedAnswer}
                  type="button"
                  onClick={() => {
                    if (!currentTypingQuestion) {
                      return;
                    }

                    setTypingSubmitted(true);
                    const normalize = (value: string) =>
                      value.trim().toLowerCase().replaceAll(" ", "");
                    const isCorrect =
                      normalize(typedAnswer) === normalize(currentTypingQuestion.answer);
                    const nextCorrect = typingCorrect + (isCorrect ? 1 : 0);
                    const isLastQuestion = typingRound + 1 >= typingQuestions.length;

                    triggerFeedback(isCorrect);

                    if (isLastQuestion) {
                      const total = Math.max(1, typingQuestions.length);
                      const score = Math.round((nextCorrect / total) * 100);
                      saveGameResult(score, "typing");
                      toast.success(
                        t("games.sessionSummary")
                          .replace("{correct}", String(nextCorrect))
                          .replace("{total}", String(total)),
                      );
                      setActiveTab("selection");
                      return;
                    }

                    setTypingCorrect(nextCorrect);
                    setTypingRound((prev) => prev + 1);
                    setTypedAnswer("");
                    setTypingSubmitted(false);
                  }}
                >
                  {typingRound + 1 >= typingQuestions.length
                    ? t("games.submitAnswer")
                    : t("games.nextQuestion")}
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

        {displayedTab === "builder" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-orange-500" aria-hidden="true" />
                {t("games.builder")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <Progress value={80} />
              <p className="rounded-lg border border-border/70 bg-muted/60 p-4 text-center">
                {t("games.builderInstruction")}
              </p>
              <div className="min-h-12 rounded-lg border border-dashed border-border/70 bg-background/70 p-2">
                {builtWord}
              </div>
              <div className="flex flex-wrap gap-2">
                {letters.map((letter, idx) => (
                  <Button
                    key={`${letter}-${idx}`}
                    size="sm"
                    variant="outline"
                    className="border-border/70 bg-background/80"
                    onClick={() => setBuiltWord((prev) => prev + letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border/70" onClick={() => setBuiltWord("")}>
                  {t("games.reset")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setBuilderSubmitted(true);
                    const target = challengeWord.answer.toUpperCase().replaceAll(" ", "");
                    const isCorrect = builtWord === target;
                    const score = isCorrect ? 100 : 35;
                    triggerFeedback(isCorrect);
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

        {displayedTab === "memoryFlip" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-fuchsia-500/15 via-pink-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-fuchsia-500" aria-hidden="true" />
                {t("games.memoryFlip")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">{t("games.memoryFlipInstruction")}</p>
              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3 sm:grid-cols-3`}>
                <div>
                  <p className="text-muted-foreground">{t("games.memoryTimeLeft")}</p>
                  <p className={`text-lg font-semibold ${urgentPulseClass}`}>{memoryTimeLeft}s</p>
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
                      className={`h-24 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        isOpen
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-border/70 bg-background/80 text-muted-foreground hover:border-primary/40"
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
                <Button variant="outline" className="border-border/70" onClick={() => setActiveTab("selection")}>
                  {t("games.backToGames")}
                </Button>
                <Button type="button" variant="outline" className="border-border/70" onClick={initializeMemoryFlip}>
                  {t("games.reset")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {displayedTab === "sprint" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-rose-500" aria-hidden="true" />
                {t("games.sprintModeTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3`}>
                <div>
                  <p className="text-muted-foreground">{t("games.sprintTimeLeft")}</p>
                  <p className={`text-lg font-semibold ${urgentPulseClass}`}>{sprintTimeLeft}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.sprintCorrect")}</p>
                  <p className="text-lg font-semibold">{sprintScore}/{Math.max(1, sprintRound)}</p>
                </div>
              </div>

              <Progress value={Math.min(100, Math.round((sprintRound / sprintQuestionPool.length) * 100))} />

              <div className={`rounded-lg border border-border/70 bg-background/80 p-4 transition-all duration-300 ${roundPulse ? "scale-[1.01]" : ""}`}>
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
                    className="justify-start border-border/70 bg-background/80"
                    disabled={sprintTimeLeft <= 0}
                    onClick={() => {
                      const isCorrect = option === currentSprintQuestion.answer;
                      triggerFeedback(isCorrect);
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

              <Button variant="outline" className="border-border/70" onClick={() => setActiveTab("selection")}>{t("games.backToGames")}</Button>
            </CardContent>
          </Card>
        )}

        {displayedTab === "speedSpelling" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-red-500/15 via-rose-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" aria-hidden="true" />
                {t("games.speedModeTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">{t("games.speedInstruction")}</p>

              <div className={`${roundSurfaceClass} grid grid-cols-2 gap-3 sm:grid-cols-4`}>
                <div>
                  <p className="text-muted-foreground">{t("games.speedTimeLeft")}</p>
                  <p className={`text-lg font-semibold ${urgentPulseClass}`}>{speedTimeLeft}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.speedScoreLabel")}</p>
                  <p className="text-lg font-semibold">{speedScore}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.speedCombo")}</p>
                  <p className={`text-lg font-semibold ${speedCombo >= 2 ? "animate-pulse text-emerald-500" : ""}`}>
                    x{speedCombo}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("games.speedBonusTime")}</p>
                  <p className="text-lg font-semibold">+{speedBonusTime}s</p>
                </div>
              </div>

              <Progress
                value={
                  speedChallenges.length > 0
                    ? Math.round((speedRound / speedChallenges.length) * 100)
                    : 0
                }
              />

              <div className={`rounded-lg border border-border/70 bg-background/80 p-4 transition-all duration-300 ${roundPulse ? "scale-[1.01]" : ""}`}>
                <p className="text-xs text-muted-foreground">
                  {t("games.roundLabel")}: {Math.min(speedRound + 1, Math.max(1, speedChallenges.length))}/{Math.max(1, speedChallenges.length)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t("games.speedTargetMeaning")}</p>
                <p className="mt-1 text-lg font-semibold">{currentSpeedChallenge?.prompt ?? "-"}</p>
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!currentSpeedChallenge || speedInput.trim().length === 0 || speedTimeLeft <= 0) {
                    return;
                  }

                  const normalize = (value: string) => value.trim().toLowerCase().replaceAll(" ", "");
                  const isCorrect = normalize(speedInput) === normalize(currentSpeedChallenge.answer);
                  triggerFeedback(isCorrect);

                  if (!isCorrect) {
                    setSpeedCombo(0);
                    setSpeedTimeLeft((prev) => Math.max(0, prev - 2));
                    setSpeedInput("");
                    toast.error(t("games.answerTryAgain"));
                    return;
                  }

                  const nextCombo = speedCombo + 1;
                  const bonusSeconds = nextCombo % 3 === 0 ? 2 : 0;
                  const gainedScore = 10 + nextCombo * 2;
                  const nextScore = speedScore + gainedScore;

                  setSpeedScore(nextScore);
                  setSpeedCombo(nextCombo);
                  setSpeedBestCombo((prev) => Math.max(prev, nextCombo));
                  if (bonusSeconds > 0) {
                    setSpeedBonusTime((prev) => prev + bonusSeconds);
                    setSpeedTimeLeft((prev) => Math.min(60, prev + bonusSeconds));
                  }

                  if (speedRound + 1 >= speedChallenges.length) {
                    const total = Math.max(1, speedChallenges.length);
                    const maxExpectedScore = total * 20;
                    const scorePercent = Math.max(
                      0,
                      Math.min(100, Math.round((nextScore / maxExpectedScore) * 100)),
                    );
                    saveGameResult(scorePercent, "speedSpelling");
                    toast.success(
                      `${t("games.speedCompleted")} - ${t("games.speedScoreLabel")}: ${nextScore}`,
                    );
                    setActiveTab("selection");
                    return;
                  }

                  setSpeedRound((prev) => prev + 1);
                  setSpeedInput("");
                }}
              >
                <input
                  value={speedInput}
                  onChange={(event) => setSpeedInput(event.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/90 px-4 py-2"
                  placeholder={t("games.speedInputPlaceholder")}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="border-border/70" onClick={() => setActiveTab("selection")}>
                    {t("games.backToGames")}
                  </Button>
                  <Button type="submit" disabled={speedInput.trim().length === 0 || speedTimeLeft <= 0}>
                    {t("games.submitAnswer")}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-muted-foreground">
                {t("games.speedBestCombo")}: x{speedBestCombo}
              </p>
            </CardContent>
          </Card>
        )}

        {displayedTab === "listening" && (
          <Card className={`relative overflow-hidden border-border/70 bg-card/95 ${interactiveCardClass}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-violet-500" aria-hidden="true" />
                {t("games.listeningModeTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/60 p-4 text-sm">
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
                  className="h-10 w-full rounded-lg border border-border/70 bg-background/90 px-3 text-sm"
                >
                  <option value="en-US">{t("games.voiceEnUs")}</option>
                  <option value="en-GB">{t("games.voiceEnGb")}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/70"
                  onClick={() => {
                    setListeningReplay((prev) => prev + 1);
                    speakListeningPrompt();
                  }}
                >
                  {t("games.listeningReplay")} ({listeningReplay})
                </Button>
                <Button variant="outline" className="border-border/70" onClick={() => setActiveTab("selection")}>{t("games.backToGames")}</Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {t("games.listeningInstruction")}
              </p>

              {listeningOptions.map((option, index) => (
                <Button
                  key={option}
                  variant={listeningAnswer === option ? "default" : "outline"}
                  className="w-full justify-start border-border/70 bg-background/80"
                  onClick={() => setListeningAnswer(option)}
                  style={{ transitionDelay: `${index * 45}ms` }}
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
                  triggerFeedback(isCorrect);
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
        </div>
      </main>
    </div>
  );
}
