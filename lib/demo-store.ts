export type DemoRole = "learner" | "teacher";

export interface DemoDeck {
  id: string;
  name: string;
  descVi: string;
  descEn: string;
  cards: number;
  mastered: number;
  reviewedToday: number;
  levelVi: string;
  levelEn: string;
  dueToday: number;
}

export interface DemoProfile {
  fullName: string;
  email: string;
  phone: string;
  bioVi: string;
  bioEn: string;
  role: DemoRole;
}

export interface DemoGameStats {
  gamesPlayed: number;
  averageScore: number;
  perfectScore: number;
  pointsEarned: number;
}

export interface DemoStudyStats {
  streakDays: number;
  todayCards: number;
  totalCards: number;
  accuracy: number;
  totalStudyMinutes: number;
}

export interface DemoSession {
  isLoggedIn: boolean;
  email: string;
  provider: "password" | "google" | "facebook";
}

export interface DemoNotificationSettings {
  dailyReminder: boolean;
  weeklyReport: boolean;
  streakWarning: boolean;
}

export interface DemoStudyHistoryItem {
  date: string;
  cards: number;
  correct: number;
  minutes: number;
}

export interface DemoState {
  profile: DemoProfile;
  decks: DemoDeck[];
  selectedDeckId: string;
  gameStats: DemoGameStats;
  studyStats: DemoStudyStats;
  session: DemoSession;
  notifications: DemoNotificationSettings;
  studyNotes: Record<string, string>;
  studyHistory: DemoStudyHistoryItem[];
}

const STORAGE_KEY = "tailflash-demo-state";

const defaultDecks: DemoDeck[] = [
  {
    id: "toeic-core",
    name: "TOEIC Core",
    descVi: "Từ vựng cốt lõi cho TOEIC",
    descEn: "Core vocabulary for TOEIC",
    cards: 120,
    mastered: 64,
    reviewedToday: 16,
    levelVi: "Trung bình",
    levelEn: "Intermediate",
    dueToday: 22,
  },
  {
    id: "business-english",
    name: "Business English",
    descVi: "Từ vựng công sở thực tế",
    descEn: "Practical office vocabulary",
    cards: 80,
    mastered: 27,
    reviewedToday: 7,
    levelVi: "Nâng cao",
    levelEn: "Advanced",
    dueToday: 10,
  },
  {
    id: "daily-conversation",
    name: "Daily Conversation",
    descVi: "Mẫu câu giao tiếp hằng ngày",
    descEn: "Everyday conversation patterns",
    cards: 60,
    mastered: 35,
    reviewedToday: 4,
    levelVi: "Cơ bản",
    levelEn: "Basic",
    dueToday: 8,
  },
];

const defaultProfile: DemoProfile = {
  fullName: "Nguyen Van A",
  email: "learner@example.com",
  phone: "+84 912 345 678",
  bioVi: "Nguoi hoc yeu thich flashcards.",
  bioEn: "Learner who loves flashcards.",
  role: "learner",
};

export function createDefaultDemoState(): DemoState {
  return {
    profile: defaultProfile,
    decks: defaultDecks,
    selectedDeckId: defaultDecks[0].id,
    gameStats: {
      gamesPlayed: 24,
      averageScore: 92,
      perfectScore: 18,
      pointsEarned: 285,
    },
    studyStats: {
      streakDays: 15,
      todayCards: defaultDecks.reduce((sum, deck) => sum + deck.reviewedToday, 0),
      totalCards: defaultDecks.reduce((sum, deck) => sum + deck.cards, 0),
      accuracy: 89,
      totalStudyMinutes: 7680,
    },
    session: {
      isLoggedIn: false,
      email: "",
      provider: "password",
    },
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      streakWarning: true,
    },
    studyNotes: {},
    studyHistory: [],
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function safeParse(raw: string | null): DemoState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      ...createDefaultDemoState(),
      ...parsed,
      profile: {
        ...defaultProfile,
        ...(parsed.profile ?? {}),
      },
      session: {
        isLoggedIn: Boolean(parsed.session?.isLoggedIn),
        email: parsed.session?.email ?? "",
        provider: parsed.session?.provider ?? "password",
      },
      gameStats: {
        ...createDefaultDemoState().gameStats,
        ...(parsed.gameStats ?? {}),
      },
      studyStats: {
        ...createDefaultDemoState().studyStats,
        ...(parsed.studyStats ?? {}),
      },
      decks:
        parsed.decks && parsed.decks.length > 0
          ? parsed.decks
          : createDefaultDemoState().decks,
      selectedDeckId:
        parsed.selectedDeckId ?? createDefaultDemoState().selectedDeckId,
      notifications: {
        ...createDefaultDemoState().notifications,
        ...(parsed.notifications ?? {}),
      },
      studyNotes: parsed.studyNotes ?? {},
      studyHistory: parsed.studyHistory ?? [],
    };
  } catch {
    return null;
  }
}

export function readDemoState(): DemoState {
  const fallback = createDefaultDemoState();
  if (!canUseStorage()) {
    return fallback;
  }

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  return parsed;
}

export function writeDemoState(next: DemoState): DemoState {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function updateDemoState(
  updater: (current: DemoState) => DemoState,
): DemoState {
  const current = readDemoState();
  const next = updater(current);
  return writeDemoState(next);
}

export function signInWithOAuthDemo(input: {
  provider: "google" | "facebook";
  role?: DemoRole;
}): DemoState {
  const providerName = input.provider === "google" ? "Google" : "Facebook";
  const email =
    input.provider === "google"
      ? "google.demo@tailflash.local"
      : "facebook.demo@tailflash.local";

  return updateDemoState((current) => ({
    ...current,
    session: {
      isLoggedIn: true,
      email,
      provider: input.provider,
    },
    profile: {
      ...current.profile,
      fullName: `${providerName} Demo User`,
      email,
      role: input.role ?? current.profile.role,
    },
  }));
}

export function saveStudyNote(input: { deckId: string; note: string }): DemoState {
  return updateDemoState((current) => ({
    ...current,
    studyNotes: {
      ...current.studyNotes,
      [input.deckId]: input.note,
    },
  }));
}

export function updateNotificationSettings(
  settings: Partial<DemoNotificationSettings>,
): DemoState {
  return updateDemoState((current) => ({
    ...current,
    notifications: {
      ...current.notifications,
      ...settings,
    },
  }));
}

export function signOutAllDemoSessions(): DemoState {
  return updateDemoState((current) => ({
    ...current,
    session: {
      isLoggedIn: false,
      email: "",
      provider: "password",
    },
  }));
}

export function resetDemoState(): DemoState {
  const fresh = createDefaultDemoState();
  return writeDemoState(fresh);
}

export function recordStudyResult(input: {
  correctCount: number;
  totalCards: number;
  deckId: string;
}): DemoState {
  return updateDemoState((current) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const estimatedMinutes = Math.max(5, Math.round(input.totalCards * 1.5));
    const decks = current.decks.map((deck) => {
      if (deck.id !== input.deckId) {
        return deck;
      }

      const reviewedToday = deck.reviewedToday + input.totalCards;
      const mastered = Math.min(deck.cards, deck.mastered + input.correctCount);

      return {
        ...deck,
        reviewedToday,
        mastered,
        dueToday: Math.max(0, deck.dueToday - input.correctCount),
      };
    });

    const totalCards = decks.reduce((sum, deck) => sum + deck.cards, 0);
    const todayCards = decks.reduce((sum, deck) => sum + deck.reviewedToday, 0);
    const totalReviewed = Math.max(
      1,
      current.studyStats.todayCards + input.totalCards,
    );
    const accuracy = Math.round((input.correctCount / Math.max(1, input.totalCards)) * 100);
    const existingTodayIndex = current.studyHistory.findIndex(
      (entry) => entry.date === todayKey,
    );
    const nextStudyHistory = [...current.studyHistory];

    if (existingTodayIndex >= 0) {
      const entry = nextStudyHistory[existingTodayIndex];
      nextStudyHistory[existingTodayIndex] = {
        ...entry,
        cards: entry.cards + input.totalCards,
        correct: entry.correct + input.correctCount,
        minutes: entry.minutes + estimatedMinutes,
      };
    } else {
      nextStudyHistory.push({
        date: todayKey,
        cards: input.totalCards,
        correct: input.correctCount,
        minutes: estimatedMinutes,
      });
    }

    return {
      ...current,
      decks,
      studyHistory: nextStudyHistory,
      studyStats: {
        ...current.studyStats,
        totalCards,
        todayCards,
        streakDays: current.studyStats.streakDays + 1,
        totalStudyMinutes:
          current.studyStats.totalStudyMinutes + estimatedMinutes,
        accuracy: Math.round((current.studyStats.accuracy + accuracy) / 2),
      },
      selectedDeckId: input.deckId,
      gameStats: {
        ...current.gameStats,
        pointsEarned: current.gameStats.pointsEarned + Math.max(5, Math.round((input.correctCount / totalReviewed) * 120)),
      },
    };
  });
}

export function recordGameResult(input: {
  scorePercent: number;
  points: number;
  perfect: boolean;
}): DemoState {
  return updateDemoState((current) => {
    const gamesPlayed = current.gameStats.gamesPlayed + 1;
    const averageScore = Math.round(
      (current.gameStats.averageScore * current.gameStats.gamesPlayed + input.scorePercent) /
        gamesPlayed,
    );

    return {
      ...current,
      gameStats: {
        gamesPlayed,
        averageScore,
        perfectScore: current.gameStats.perfectScore + (input.perfect ? 1 : 0),
        pointsEarned: current.gameStats.pointsEarned + input.points,
      },
    };
  });
}
