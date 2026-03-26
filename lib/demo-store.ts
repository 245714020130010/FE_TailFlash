export type DemoRole = "learner" | "teacher" | "admin";

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
  isUserCreated?: boolean;
  customCards?: DemoFlashcard[];
  sourceLanguage?: DemoDeckLanguageCode;
  targetLanguage?: DemoDeckLanguageCode;
}

export type DemoDeckLanguageCode = "vi" | "en" | "ja" | "ko";

export interface DemoFlashcard {
  id: string;
  term: string;
  definition: string;
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

export interface DemoGameLeaderboardEntry {
  id: string;
  name: string;
  points: number;
  gamesPlayed: number;
  streakDays: number;
}

export interface DemoDailyChallenge {
  id: string;
  titleVi: string;
  titleEn: string;
  targetScore: number;
  rewardPoints: number;
  expiresAt: string;
  completedAt: string | null;
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

export interface DemoReminderConfig {
  enabled: boolean;
  time: string;
  timezone: string;
  daysOfWeek: number[];
  nextReminderAt: string;
}

export type DemoCardOrder = "random" | "sequential";

export interface DemoSrsSettings {
  newCardsPerDay: number;
  maxReviewCardsPerDay: number;
  cardOrder: DemoCardOrder;
}

export type DemoMiniTestQuestionType =
  | "vocabulary"
  | "listening"
  | "fillBlank"
  | "context";

export interface DemoMiniTestQuestion {
  id: string;
  type: DemoMiniTestQuestionType;
  promptVi: string;
  promptEn: string;
  choices: string[];
  answerIndex: number | null;
  answerText: string | null;
  audioText: string | null;
  deckId: string;
  wrongCount: number;
  srsDueLevel: "low" | "medium" | "high";
  lastReviewedAt: string | null;
}

export interface DemoMiniTestStats {
  testsTaken: number;
  bestScore: number;
  averageScore: number;
  lastScore: number;
}

export interface DemoTeacherApplication {
  status: "none" | "pending" | "approved" | "rejected";
  submittedAt: string | null;
  documentsCount: number;
  note: string;
  reviewedBy: string | null;
}

export interface DemoClassroom {
  id: string;
  name: string;
  studentCount: number;
  deckId: string;
  completionRate: number;
  averageScore: number;
  atRiskStudents: number;
  weeklyActiveRate: number;
}

export interface DemoAssignment {
  id: string;
  classId: string;
  title: string;
  dueDate: string;
  assignedCount: number;
  submittedCount: number;
  status: "active" | "closed";
  averageScore: number;
  lateSubmissions: number;
}

export interface DemoStudentInsight {
  id: string;
  classId: string;
  fullName: string;
  completionRate: number;
  averageScore: number;
  missedAssignments: number;
  inactiveDays: number;
  streakDays: number;
}

export interface DemoAdminStats {
  pendingTeacherApprovals: number;
  reportsOpen: number;
  activeUsers: number;
  deckModerations: number;
}

export interface DemoAdminQueueItem {
  id: string;
  applicantName: string;
  email: string;
  specialty: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface DemoContentReport {
  id: string;
  deckName: string;
  reason: string;
  severity: "low" | "medium" | "high";
  status: "open" | "triaged" | "in_review" | "action_required" | "resolved";
  reporterName: string;
  reportedAt: string;
  assignedModerator: string | null;
  resolutionNote: string;
}

export interface DemoStudyHistoryItem {
  date: string;
  cards: number;
  correct: number;
  minutes: number;
}

export interface DemoXpHistoryItem {
  date: string;
  xp: number;
  source: "study" | "test" | "game";
}

export interface DemoPointsLedger {
  game: number;
  miniTest: number;
  study: number;
  total: number;
}

export type DemoGameType =
  | "matching"
  | "multiple"
  | "typing"
  | "builder"
  | "memoryFlip"
  | "sprint"
  | "listening";

export interface DemoActivityItem {
  id: string;
  type: "study" | "game" | "test";
  gameType?: DemoGameType;
  titleVi: string;
  titleEn: string;
  points: number;
  createdAt: string;
}

export interface DemoState {
  profile: DemoProfile;
  decks: DemoDeck[];
  selectedDeckId: string;
  gameStats: DemoGameStats;
  gameLeaderboard: DemoGameLeaderboardEntry[];
  dailyChallenge: DemoDailyChallenge;
  miniTestStats: DemoMiniTestStats;
  miniTestQuestionBank: DemoMiniTestQuestion[];
  studyStats: DemoStudyStats;
  session: DemoSession;
  notifications: DemoNotificationSettings;
  reminder: DemoReminderConfig;
  srsSettings: DemoSrsSettings;
  teacherApplication: DemoTeacherApplication;
  classrooms: DemoClassroom[];
  assignments: DemoAssignment[];
  studentInsights: DemoStudentInsight[];
  adminStats: DemoAdminStats;
  adminQueue: DemoAdminQueueItem[];
  contentReports: DemoContentReport[];
  studyNotes: Record<string, string>;
  studyHistory: DemoStudyHistoryItem[];
  xpHistory: DemoXpHistoryItem[];
  pointsLedger: DemoPointsLedger;
  recentActivity: DemoActivityItem[];
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

const defaultMiniTestQuestionBank: DemoMiniTestQuestion[] = [
  {
    id: "q-1",
    type: "vocabulary",
    promptVi: "Chọn nghĩa đúng của từ 'accomplish'.",
    promptEn: "Choose the correct meaning of 'accomplish'.",
    choices: ["To avoid", "To complete successfully", "To delay", "To refuse"],
    answerIndex: 1,
    answerText: null,
    audioText: null,
    deckId: "toeic-core",
    wrongCount: 1,
    srsDueLevel: "medium",
    lastReviewedAt: null,
  },
  {
    id: "q-2",
    type: "vocabulary",
    promptVi: "Chọn từ đồng nghĩa gần nhất với 'negotiate'.",
    promptEn: "Select the best synonym for 'negotiate'.",
    choices: ["Bargain", "Celebrate", "Ignore", "Combine"],
    answerIndex: 0,
    answerText: null,
    audioText: null,
    deckId: "business-english",
    wrongCount: 2,
    srsDueLevel: "high",
    lastReviewedAt: null,
  },
  {
    id: "q-3",
    type: "vocabulary",
    promptVi: "'hang out' thường có nghĩa là gì?",
    promptEn: "What does 'hang out' usually mean?",
    choices: ["Work overtime", "Relax with friends", "Travel abroad", "Study deeply"],
    answerIndex: 1,
    answerText: null,
    audioText: null,
    deckId: "daily-conversation",
    wrongCount: 0,
    srsDueLevel: "low",
    lastReviewedAt: null,
  },
  {
    id: "q-4",
    type: "fillBlank",
    promptVi: "Điền từ phù hợp: 'We need to ___ a strategy.'",
    promptEn: "Fill in the blank: 'We need to ___ a strategy.'",
    choices: ["develop", "borrow", "freeze", "repair"],
    answerIndex: 0,
    answerText: "develop",
    audioText: null,
    deckId: "toeic-core",
    wrongCount: 1,
    srsDueLevel: "medium",
    lastReviewedAt: null,
  },
  {
    id: "q-5",
    type: "context",
    promptVi: "Chọn cụm từ đúng theo ngữ cảnh: 'Even when the task was hard, they decided to ___. '",
    promptEn: "Choose the phrase that fits context: 'Even when the task was hard, they decided to ___.'",
    choices: ["Give up", "Keep going", "Look down", "Set aside"],
    answerIndex: 1,
    answerText: null,
    audioText: null,
    deckId: "daily-conversation",
    wrongCount: 3,
    srsDueLevel: "high",
    lastReviewedAt: null,
  },
  {
    id: "q-6",
    type: "listening",
    promptVi: "Nghe cụm từ và chọn nghĩa đúng.",
    promptEn: "Listen to the phrase and choose the correct meaning.",
    choices: ["Đưa ra quyết định", "Đến nơi đúng giờ", "Trì hoãn việc", "Đưa ai đó về"],
    answerIndex: 1,
    answerText: null,
    audioText: "arrive on time",
    deckId: "toeic-core",
    wrongCount: 1,
    srsDueLevel: "medium",
    lastReviewedAt: null,
  },
  {
    id: "q-7",
    type: "listening",
    promptVi: "Nghe từ và chọn nghĩa đúng.",
    promptEn: "Listen to the word and choose the correct meaning.",
    choices: ["Từ chối lời mời", "Thương lượng điều khoản", "Bỏ qua thông tin", "Hoãn cuộc họp"],
    answerIndex: 1,
    answerText: null,
    audioText: "negotiate terms",
    deckId: "business-english",
    wrongCount: 2,
    srsDueLevel: "high",
    lastReviewedAt: null,
  },
  {
    id: "q-8",
    type: "fillBlank",
    promptVi: "Điền từ còn thiếu: 'Please ___ the report before 5 PM.'",
    promptEn: "Fill in the blank: 'Please ___ the report before 5 PM.'",
    choices: ["submit", "break", "ignore", "forget"],
    answerIndex: 0,
    answerText: "submit",
    audioText: null,
    deckId: "business-english",
    wrongCount: 0,
    srsDueLevel: "medium",
    lastReviewedAt: null,
  },
  {
    id: "q-9",
    type: "context",
    promptVi: "Chọn câu trả lời phù hợp: 'My phone stopped working yesterday. It ___.'",
    promptEn: "Choose the best completion: 'My phone stopped working yesterday. It ___. '",
    choices: ["broke down", "picked up", "looked after", "set up"],
    answerIndex: 0,
    answerText: null,
    audioText: null,
    deckId: "daily-conversation",
    wrongCount: 1,
    srsDueLevel: "medium",
    lastReviewedAt: null,
  },
];

function startOfNextDay(input: Date): Date {
  const next = new Date(input);
  next.setHours(24, 0, 0, 0);
  return next;
}

function createDefaultDailyChallenge(now = new Date()): DemoDailyChallenge {
  return {
    id: `daily-${now.toISOString().slice(0, 10)}`,
    titleVi: "Đạt 80% trong bất kỳ mini game",
    titleEn: "Score 80% in any mini game",
    targetScore: 80,
    rewardPoints: 30,
    expiresAt: startOfNextDay(now).toISOString(),
    completedAt: null,
  };
}

function createDefaultLeaderboard(playerName: string): DemoGameLeaderboardEntry[] {
  return [
    {
      id: "leader-1",
      name: "An Nguyen",
      points: 420,
      gamesPlayed: 42,
      streakDays: 22,
    },
    {
      id: "leader-2",
      name: "Linh Tran",
      points: 388,
      gamesPlayed: 37,
      streakDays: 18,
    },
    {
      id: "you",
      name: playerName,
      points: 285,
      gamesPlayed: 24,
      streakDays: 15,
    },
    {
      id: "leader-4",
      name: "Bao Le",
      points: 271,
      gamesPlayed: 28,
      streakDays: 12,
    },
  ];
}

function getNextReminderDate(input: {
  time: string;
  daysOfWeek: number[];
  from?: Date;
}): Date {
  const now = input.from ?? new Date();
  const [hours, minutes] = input.time.split(":").map((item) => Number(item));
  const activeDays =
    input.daysOfWeek.length > 0 ? input.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hours || 20, minutes || 30, 0, 0);

    if (!activeDays.includes(candidate.getDay())) {
      continue;
    }

    if (candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }

  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 1);
  fallback.setHours(hours || 20, minutes || 30, 0, 0);
  return fallback;
}

function syncCurrentPlayerLeaderboard(input: {
  leaderboard: DemoGameLeaderboardEntry[];
  playerName: string;
  points: number;
  gamesPlayed: number;
  streakDays: number;
}): DemoGameLeaderboardEntry[] {
  const existing = input.leaderboard.find((entry) => entry.id === "you");
  const base = input.leaderboard.filter((entry) => entry.id !== "you");
  const me: DemoGameLeaderboardEntry = {
    id: "you",
    name: input.playerName,
    points: input.points,
    gamesPlayed: input.gamesPlayed,
    streakDays: input.streakDays,
  };

  const merged = [...base, existing ? { ...existing, ...me } : me];

  return merged.sort((a, b) => b.points - a.points).slice(0, 8);
}

function refreshDailyChallengeIfNeeded(state: DemoState): DemoState {
  if (new Date(state.dailyChallenge.expiresAt).getTime() > Date.now()) {
    return state;
  }

  return {
    ...state,
    dailyChallenge: createDefaultDailyChallenge(),
  };
}

const DEMO_LEVELS = [
  { key: "beginner", minXp: 0, maxXp: 500 },
  { key: "learner", minXp: 500, maxXp: 1500 },
  { key: "intermediate", minXp: 1500, maxXp: 4000 },
  { key: "advanced", minXp: 4000, maxXp: 10000 },
  { key: "master", minXp: 10000, maxXp: null },
] as const;

export type DemoLevelKey = (typeof DEMO_LEVELS)[number]["key"];

export interface DemoLevelInfo {
  key: DemoLevelKey;
  minXp: number;
  maxXp: number | null;
}

export function getDemoLevelFromXp(xp: number): DemoLevelInfo {
  const safeXp = Math.max(0, xp);
  const found =
    DEMO_LEVELS.find((item) => item.maxXp !== null && safeXp < item.maxXp) ??
    DEMO_LEVELS[DEMO_LEVELS.length - 1];

  return {
    key: found.key,
    minXp: found.minXp,
    maxXp: found.maxXp,
  };
}

function getGameTypeLabel(type: DemoGameType): { vi: string; en: string } {
  const labels: Record<DemoGameType, { vi: string; en: string }> = {
    matching: { vi: "Matching", en: "Matching" },
    multiple: { vi: "Multiple Choice", en: "Multiple Choice" },
    typing: { vi: "Typing", en: "Typing" },
    builder: { vi: "Word Builder", en: "Word Builder" },
    memoryFlip: { vi: "Memory Flip", en: "Memory Flip" },
    sprint: { vi: "Sprint", en: "Sprint" },
    listening: { vi: "Listening", en: "Listening" },
  };

  return labels[type];
}

function appendRecentActivity(
  current: DemoActivityItem[],
  next: Omit<DemoActivityItem, "id" | "createdAt">,
): DemoActivityItem[] {
  return [
    {
      ...next,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 10);
}

function appendXpHistory(
  current: DemoXpHistoryItem[],
  input: { xp: number; source: DemoXpHistoryItem["source"]; date?: string },
): DemoXpHistoryItem[] {
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  return [
    ...current,
    {
      date,
      xp: input.xp,
      source: input.source,
    },
  ].slice(-120);
}

export function getStudentRiskScore(student: DemoStudentInsight): number {
  const completionRisk = Math.max(0, 65 - student.completionRate) * 0.7;
  const scoreRisk = Math.max(0, 70 - student.averageScore) * 0.8;
  const missedRisk = student.missedAssignments * 11;
  const inactiveRisk = Math.min(40, student.inactiveDays * 1.8);
  const streakRelief = Math.min(12, student.streakDays * 0.7);

  const total = Math.round(completionRisk + scoreRisk + missedRisk + inactiveRisk - streakRelief);
  return Math.max(0, Math.min(100, total));
}

export function createDefaultDemoState(): DemoState {
  const defaultGameStats = {
    gamesPlayed: 24,
    averageScore: 92,
    perfectScore: 18,
    pointsEarned: 285,
  };

  return {
    profile: defaultProfile,
    decks: defaultDecks,
    selectedDeckId: defaultDecks[0].id,
    gameStats: defaultGameStats,
    gameLeaderboard: createDefaultLeaderboard(defaultProfile.fullName),
    dailyChallenge: createDefaultDailyChallenge(),
    miniTestStats: {
      testsTaken: 8,
      bestScore: 95,
      averageScore: 84,
      lastScore: 88,
    },
    miniTestQuestionBank: defaultMiniTestQuestionBank,
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
    reminder: {
      enabled: true,
      time: "20:30",
      timezone: "Asia/Ho_Chi_Minh",
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      nextReminderAt: getNextReminderDate({
        time: "20:30",
        daysOfWeek: [1, 2, 3, 4, 5, 6],
      }).toISOString(),
    },
    srsSettings: {
      newCardsPerDay: 20,
      maxReviewCardsPerDay: 100,
      cardOrder: "sequential",
    },
    teacherApplication: {
      status: "pending",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      documentsCount: 2,
      note: "TOEIC trainer with 4 years of mentoring experience.",
      reviewedBy: null,
    },
    classrooms: [
      {
        id: "class-9a",
        name: "Lop 9A - Tang toc tu vung",
        studentCount: 28,
        deckId: "toeic-core",
        completionRate: 72,
        averageScore: 81,
        atRiskStudents: 4,
        weeklyActiveRate: 89,
      },
      {
        id: "class-ielts-b1",
        name: "IELTS B1 - Writing vocabulary",
        studentCount: 17,
        deckId: "business-english",
        completionRate: 54,
        averageScore: 73,
        atRiskStudents: 5,
        weeklyActiveRate: 67,
      },
    ],
    assignments: [
      {
        id: "asg-1",
        classId: "class-9a",
        title: "Review Unit 3 - 40 cards",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        assignedCount: 28,
        submittedCount: 18,
        status: "active",
        averageScore: 79,
        lateSubmissions: 2,
      },
      {
        id: "asg-2",
        classId: "class-ielts-b1",
        title: "Academic verbs checkpoint",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        assignedCount: 17,
        submittedCount: 6,
        status: "active",
        averageScore: 71,
        lateSubmissions: 1,
      },
    ],
    studentInsights: [
      {
        id: "stu-9a-1",
        classId: "class-9a",
        fullName: "Nguyen Minh Quan",
        completionRate: 84,
        averageScore: 87,
        missedAssignments: 0,
        inactiveDays: 1,
        streakDays: 7,
      },
      {
        id: "stu-9a-2",
        classId: "class-9a",
        fullName: "Tran Khanh Linh",
        completionRate: 68,
        averageScore: 73,
        missedAssignments: 1,
        inactiveDays: 3,
        streakDays: 4,
      },
      {
        id: "stu-9a-3",
        classId: "class-9a",
        fullName: "Le Tuan Kiet",
        completionRate: 51,
        averageScore: 62,
        missedAssignments: 2,
        inactiveDays: 8,
        streakDays: 1,
      },
      {
        id: "stu-9a-4",
        classId: "class-9a",
        fullName: "Pham Gia Bao",
        completionRate: 76,
        averageScore: 79,
        missedAssignments: 1,
        inactiveDays: 2,
        streakDays: 5,
      },
      {
        id: "stu-b1-1",
        classId: "class-ielts-b1",
        fullName: "Vo Ngoc Han",
        completionRate: 59,
        averageScore: 69,
        missedAssignments: 2,
        inactiveDays: 6,
        streakDays: 2,
      },
      {
        id: "stu-b1-2",
        classId: "class-ielts-b1",
        fullName: "Bui Hoai Nam",
        completionRate: 63,
        averageScore: 71,
        missedAssignments: 1,
        inactiveDays: 4,
        streakDays: 3,
      },
      {
        id: "stu-b1-3",
        classId: "class-ielts-b1",
        fullName: "Dang Thao My",
        completionRate: 43,
        averageScore: 58,
        missedAssignments: 3,
        inactiveDays: 9,
        streakDays: 1,
      },
      {
        id: "stu-b1-4",
        classId: "class-ielts-b1",
        fullName: "Do Thanh Dat",
        completionRate: 81,
        averageScore: 83,
        missedAssignments: 0,
        inactiveDays: 2,
        streakDays: 6,
      },
    ],
    adminStats: {
      pendingTeacherApprovals: 2,
      reportsOpen: 3,
      activeUsers: 324,
      deckModerations: 11,
    },
    adminQueue: [
      {
        id: "req-1",
        applicantName: "Tran Minh Anh",
        email: "teacher.minhanh@example.com",
        specialty: "IELTS Speaking",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        status: "pending",
      },
      {
        id: "req-2",
        applicantName: "Le Quoc Bao",
        email: "bao.toeic@example.com",
        specialty: "TOEIC Listening",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        status: "pending",
      },
    ],
    contentReports: [
      {
        id: "report-1",
        deckName: "TOEIC Core",
        reason: "Typo in card #24",
        severity: "low",
        status: "open",
        reporterName: "Nguyen Hoang Anh",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        assignedModerator: null,
        resolutionNote: "",
      },
      {
        id: "report-2",
        deckName: "Business English",
        reason: "Duplicate definitions",
        severity: "medium",
        status: "triaged",
        reporterName: "Tran Thu Ha",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        assignedModerator: "mod.khanh@tailflash.local",
        resolutionNote: "Need content owner confirmation.",
      },
      {
        id: "report-3",
        deckName: "Daily Conversation",
        reason: "Potentially inappropriate example",
        severity: "high",
        status: "in_review",
        reporterName: "Le Minh Khoa",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        assignedModerator: "mod.phuong@tailflash.local",
        resolutionNote: "Reviewing context with teacher owner.",
      },
    ],
    studyNotes: {},
    studyHistory: [],
    xpHistory: [],
    pointsLedger: {
      game: defaultGameStats.pointsEarned,
      miniTest: 0,
      study: 0,
      total: defaultGameStats.pointsEarned,
    },
    recentActivity: [
      {
        id: "activity-seed-game",
        type: "game",
        gameType: "matching",
        titleVi: "Hoàn thành Mini Games với điểm cao",
        titleEn: "Completed Mini Games with a high score",
        points: 24,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "activity-seed-test",
        type: "test",
        titleVi: "Nộp Mini Test gần nhất",
        titleEn: "Submitted the latest Mini Test",
        points: 16,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: "activity-seed-study",
        type: "study",
        titleVi: "Hoàn thành một phiên SRS",
        titleEn: "Finished an SRS study session",
        points: 12,
        createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      },
    ],
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
    const defaults = createDefaultDemoState();
    const normalizeClassroom = (room: Partial<DemoClassroom>): DemoClassroom => ({
      ...defaults.classrooms[0],
      ...room,
    });
    const normalizeAssignment = (assignment: Partial<DemoAssignment>): DemoAssignment => ({
      ...defaults.assignments[0],
      ...assignment,
    });
    const normalizeStudentInsight = (student: Partial<DemoStudentInsight>): DemoStudentInsight => ({
      ...defaults.studentInsights[0],
      ...student,
    });
    const normalizeReport = (report: Partial<DemoContentReport>): DemoContentReport => ({
      ...defaults.contentReports[0],
      ...report,
    });
    const normalizeMiniTestQuestion = (
      question: Partial<DemoMiniTestQuestion> & { prompt?: string },
    ): DemoMiniTestQuestion => {
      const base = defaults.miniTestQuestionBank[0];
      const promptEn = question.promptEn ?? question.prompt ?? base.promptEn;
      const inferredType =
        question.type ??
        (question.audioText
          ? "listening"
          : promptEn.includes("___")
            ? "fillBlank"
            : "vocabulary");

      return {
        ...base,
        ...question,
        type: inferredType,
        promptEn,
        promptVi: question.promptVi ?? promptEn,
        choices: question.choices && question.choices.length > 0 ? question.choices : base.choices,
        answerIndex: typeof question.answerIndex === "number" ? question.answerIndex : null,
        answerText: question.answerText ?? null,
        audioText: question.audioText ?? null,
        deckId: question.deckId ?? base.deckId,
        wrongCount: Math.max(0, question.wrongCount ?? 0),
        srsDueLevel: question.srsDueLevel ?? "medium",
        lastReviewedAt: question.lastReviewedAt ?? null,
      };
    };

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
      gameLeaderboard:
        parsed.gameLeaderboard && parsed.gameLeaderboard.length > 0
          ? parsed.gameLeaderboard
          : createDefaultDemoState().gameLeaderboard,
      dailyChallenge: {
        ...createDefaultDemoState().dailyChallenge,
        ...(parsed.dailyChallenge ?? {}),
      },
      miniTestStats: {
        ...createDefaultDemoState().miniTestStats,
        ...(parsed.miniTestStats ?? {}),
      },
      miniTestQuestionBank:
        parsed.miniTestQuestionBank && parsed.miniTestQuestionBank.length > 0
          ? parsed.miniTestQuestionBank.map(normalizeMiniTestQuestion)
          : createDefaultDemoState().miniTestQuestionBank,
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
      reminder: {
        ...createDefaultDemoState().reminder,
        ...(parsed.reminder ?? {}),
      },
      srsSettings: {
        ...createDefaultDemoState().srsSettings,
        ...(parsed.srsSettings ?? {}),
      },
      teacherApplication: {
        ...createDefaultDemoState().teacherApplication,
        ...(parsed.teacherApplication ?? {}),
      },
      classrooms:
        parsed.classrooms && parsed.classrooms.length > 0
          ? parsed.classrooms.map(normalizeClassroom)
          : createDefaultDemoState().classrooms,
      assignments:
        parsed.assignments && parsed.assignments.length > 0
          ? parsed.assignments.map(normalizeAssignment)
          : createDefaultDemoState().assignments,
      studentInsights:
        parsed.studentInsights && parsed.studentInsights.length > 0
          ? parsed.studentInsights.map(normalizeStudentInsight)
          : createDefaultDemoState().studentInsights,
      adminStats: {
        ...createDefaultDemoState().adminStats,
        ...(parsed.adminStats ?? {}),
      },
      adminQueue:
        parsed.adminQueue && parsed.adminQueue.length > 0
          ? parsed.adminQueue
          : createDefaultDemoState().adminQueue,
      contentReports:
        parsed.contentReports && parsed.contentReports.length > 0
          ? parsed.contentReports.map(normalizeReport)
          : createDefaultDemoState().contentReports,
      studyNotes: parsed.studyNotes ?? {},
      studyHistory: parsed.studyHistory ?? [],
      xpHistory: parsed.xpHistory ?? [],
      pointsLedger: {
        ...createDefaultDemoState().pointsLedger,
        ...(parsed.pointsLedger ?? {}),
        total:
          parsed.pointsLedger?.total ??
          (parsed.pointsLedger?.game ?? parsed.gameStats?.pointsEarned ?? createDefaultDemoState().pointsLedger.game) +
            (parsed.pointsLedger?.miniTest ?? createDefaultDemoState().pointsLedger.miniTest) +
            (parsed.pointsLedger?.study ?? createDefaultDemoState().pointsLedger.study),
      },
      recentActivity:
        parsed.recentActivity && parsed.recentActivity.length > 0
          ? parsed.recentActivity
          : createDefaultDemoState().recentActivity,
    };
  } catch {
    return null;
  }
}

export function readDemoState(): DemoState {
  const fallback = createDefaultDemoState();
  if (!canUseStorage()) {
    return refreshDailyChallengeIfNeeded(fallback);
  }

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return refreshDailyChallengeIfNeeded(fallback);
  }

  const next = refreshDailyChallengeIfNeeded(parsed);
  if (next.dailyChallenge.id !== parsed.dailyChallenge.id) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function writeDemoState(next: DemoState): DemoState {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("tailflash-demo-state-changed"));
  }

  return next;
}

export function subscribeDemoState(onStoreChange: () => void): () => void {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  const onInternalChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("tailflash-demo-state-changed", onInternalChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("tailflash-demo-state-changed", onInternalChange);
  };
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

export function saveReminderSettings(
  settings: Partial<DemoReminderConfig>,
): DemoState {
  return updateDemoState((current) => {
    const reminder = {
      ...current.reminder,
      ...settings,
    };

    const nextReminderAt = getNextReminderDate({
      time: reminder.time,
      daysOfWeek: reminder.daysOfWeek,
    });

    return {
      ...current,
      reminder: {
        ...reminder,
        nextReminderAt: nextReminderAt.toISOString(),
      },
    };
  });
}

export function saveSrsSettings(settings: Partial<DemoSrsSettings>): DemoState {
  return updateDemoState((current) => {
    const nextSettings: DemoSrsSettings = {
      ...current.srsSettings,
      ...settings,
      newCardsPerDay: Math.max(1, Math.min(100, settings.newCardsPerDay ?? current.srsSettings.newCardsPerDay)),
      maxReviewCardsPerDay: Math.max(
        5,
        Math.min(300, settings.maxReviewCardsPerDay ?? current.srsSettings.maxReviewCardsPerDay),
      ),
      cardOrder: settings.cardOrder ?? current.srsSettings.cardOrder,
    };

    return {
      ...current,
      srsSettings: nextSettings,
    };
  });
}

export function completeMiniTest(input: {
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
  difficulty?: "easy" | "medium" | "hard";
  answeredQuestions?: Array<{
    questionId: string;
    correct: boolean;
  }>;
}): DemoState {
  return updateDemoState((current) => {
    const testsTaken = current.miniTestStats.testsTaken + 1;
    const averageScore = Math.round(
      (current.miniTestStats.averageScore * current.miniTestStats.testsTaken + input.scorePercent) /
        testsTaken,
    );

    const difficultyMultiplier: Record<"easy" | "medium" | "hard", number> = {
      easy: 0.85,
      medium: 1,
      hard: 1.2,
    };
    const chosenDifficulty = input.difficulty ?? "medium";
    const basePoints = input.correctCount * 8;
    const pointsEarned =
      basePoints === 0 ? 0 : Math.round(basePoints * difficultyMultiplier[chosenDifficulty]);
    const answerMap = new Map(
      (input.answeredQuestions ?? []).map((item) => [item.questionId, item.correct]),
    );
    const nowIso = new Date().toISOString();

    const updatedQuestionBank = current.miniTestQuestionBank.map((question) => {
      const wasCorrect = answerMap.get(question.id);
      if (wasCorrect === undefined) {
        return question;
      }

      const wrongCount = wasCorrect
        ? Math.max(0, question.wrongCount - 1)
        : question.wrongCount + 1;
      const srsDueLevel: DemoMiniTestQuestion["srsDueLevel"] =
        wrongCount >= 3 ? "high" : wrongCount >= 1 ? "medium" : "low";

      return {
        ...question,
        wrongCount,
        srsDueLevel,
        lastReviewedAt: nowIso,
      };
    });

    return {
      ...current,
      miniTestStats: {
        testsTaken,
        averageScore,
        bestScore: Math.max(current.miniTestStats.bestScore, input.scorePercent),
        lastScore: input.scorePercent,
      },
      gameStats: {
        ...current.gameStats,
        pointsEarned: current.gameStats.pointsEarned + pointsEarned,
      },
      pointsLedger: {
        game: current.pointsLedger.game,
        miniTest: current.pointsLedger.miniTest + pointsEarned,
        study: current.pointsLedger.study,
        total: current.pointsLedger.total + pointsEarned,
      },
      xpHistory: appendXpHistory(current.xpHistory, {
        xp: pointsEarned,
        source: "test",
      }),
      recentActivity: appendRecentActivity(current.recentActivity, {
        type: "test",
        titleVi: `Mini Test (${chosenDifficulty}): ${input.correctCount}/${input.totalQuestions} câu đúng`,
        titleEn: `Mini Test (${chosenDifficulty}): ${input.correctCount}/${input.totalQuestions} correct answers`,
        points: pointsEarned,
      }),
      miniTestQuestionBank: updatedQuestionBank,
    };
  });
}

export function submitTeacherApplication(input: {
  note: string;
  documentsCount: number;
}): DemoState {
  return updateDemoState((current) => ({
    ...current,
    teacherApplication: {
      status: "pending",
      submittedAt: new Date().toISOString(),
      documentsCount: input.documentsCount,
      note: input.note,
      reviewedBy: null,
    },
  }));
}

export function reviewTeacherApplication(input: {
  requestId: string;
  status: "approved" | "rejected";
  reviewedBy: string;
}): DemoState {
  return updateDemoState((current) => {
    const adminQueue = current.adminQueue.map((item) => {
      if (item.id !== input.requestId) {
        return item;
      }

      return {
        ...item,
        status: input.status,
      };
    });

    const pendingTeacherApprovals = adminQueue.filter(
      (item) => item.status === "pending",
    ).length;

    return {
      ...current,
      profile:
        current.teacherApplication.status === "pending"
          ? {
              ...current.profile,
              role: input.status === "approved" ? "teacher" : "learner",
            }
          : current.profile,
      adminQueue,
      adminStats: {
        ...current.adminStats,
        pendingTeacherApprovals,
      },
      teacherApplication:
        current.teacherApplication.status === "pending"
          ? {
              ...current.teacherApplication,
              status: input.status,
              reviewedBy: input.reviewedBy,
            }
          : current.teacherApplication,
    };
  });
}

export function setDemoRole(role: DemoRole): DemoState {
  return updateDemoState((current) => ({
    ...current,
    profile: {
      ...current.profile,
      role,
    },
  }));
}

export function createClassroom(input: { name: string; deckId: string }): DemoState {
  return updateDemoState((current) => ({
    ...current,
    classrooms: [
      {
        id: `class-${Date.now()}`,
        name: input.name,
        studentCount: 0,
        deckId: input.deckId,
        completionRate: 0,
        averageScore: 0,
        atRiskStudents: 0,
        weeklyActiveRate: 0,
      },
      ...current.classrooms,
    ],
  }));
}

export function createAssignment(input: {
  classId: string;
  title: string;
  dueDate: string;
}): DemoState {
  return updateDemoState((current) => {
    const classroom = current.classrooms.find((item) => item.id === input.classId);

    if (!classroom) {
      return current;
    }

    return {
      ...current,
      assignments: [
        {
          id: `asg-${Date.now()}`,
          classId: input.classId,
          title: input.title,
          dueDate: input.dueDate,
          assignedCount: classroom.studentCount,
          submittedCount: 0,
          status: "active",
          averageScore: 0,
          lateSubmissions: 0,
        },
        ...current.assignments,
      ],
    };
  });
}

export function simulateAssignmentProgress(input: {
  assignmentId: string;
  submittedDelta: number;
  averageScoreDelta?: number;
}): DemoState {
  return updateDemoState((current) => {
    const targetAssignment = current.assignments.find((assignment) => assignment.id === input.assignmentId);
    const assignments = current.assignments.map((assignment) => {
      if (assignment.id !== input.assignmentId || assignment.status === "closed") {
        return assignment;
      }

      const submittedCount = Math.min(
        assignment.assignedCount,
        assignment.submittedCount + Math.max(0, input.submittedDelta),
      );
      const averageScore = Math.min(
        100,
        Math.max(0, assignment.averageScore + (input.averageScoreDelta ?? 2)),
      );

      return {
        ...assignment,
        submittedCount,
        averageScore,
      };
    });

    const studentInsights = !targetAssignment
      ? current.studentInsights
      : current.studentInsights.map((student, index) => {
          if (student.classId !== targetAssignment.classId) {
            return student;
          }

          const touched = index % 2 === 0;
          if (!touched) {
            return student;
          }

          return {
            ...student,
            completionRate: Math.min(100, student.completionRate + 3),
            averageScore: Math.min(100, student.averageScore + Math.max(1, input.averageScoreDelta ?? 2)),
            missedAssignments: Math.max(0, student.missedAssignments - 1),
            inactiveDays: Math.max(0, student.inactiveDays - 1),
            streakDays: Math.min(30, student.streakDays + 1),
          };
        });

    return {
      ...current,
      assignments,
      studentInsights,
    };
  });
}

export function simulateStudentIntervention(input: {
  studentId: string;
  completionDelta?: number;
  scoreDelta?: number;
  missedAssignmentsDelta?: number;
  inactiveDaysDelta?: number;
  streakDelta?: number;
}): DemoState {
  return updateDemoState((current) => ({
    ...current,
    studentInsights: current.studentInsights.map((student) => {
      if (student.id !== input.studentId) {
        return student;
      }

      return {
        ...student,
        completionRate: Math.min(100, Math.max(0, student.completionRate + (input.completionDelta ?? 5))),
        averageScore: Math.min(100, Math.max(0, student.averageScore + (input.scoreDelta ?? 4))),
        missedAssignments: Math.max(0, student.missedAssignments + (input.missedAssignmentsDelta ?? -1)),
        inactiveDays: Math.max(0, student.inactiveDays + (input.inactiveDaysDelta ?? -2)),
        streakDays: Math.min(60, Math.max(0, student.streakDays + (input.streakDelta ?? 2))),
      };
    }),
  }));
}

export function simulateStudentInterventions(input: {
  updates: Array<{
    studentId: string;
    completionDelta?: number;
    scoreDelta?: number;
    missedAssignmentsDelta?: number;
    inactiveDaysDelta?: number;
    streakDelta?: number;
  }>;
}): DemoState {
  return updateDemoState((current) => {
    const updateById = new Map(input.updates.map((item) => [item.studentId, item]));

    return {
      ...current,
      studentInsights: current.studentInsights.map((student) => {
        const update = updateById.get(student.id);
        if (!update) {
          return student;
        }

        return {
          ...student,
          completionRate: Math.min(100, Math.max(0, student.completionRate + (update.completionDelta ?? 0))),
          averageScore: Math.min(100, Math.max(0, student.averageScore + (update.scoreDelta ?? 0))),
          missedAssignments: Math.max(0, student.missedAssignments + (update.missedAssignmentsDelta ?? 0)),
          inactiveDays: Math.max(0, student.inactiveDays + (update.inactiveDaysDelta ?? 0)),
          streakDays: Math.min(60, Math.max(0, student.streakDays + (update.streakDelta ?? 0))),
        };
      }),
    };
  });
}

export function upsertStudentInsightsFromCsv(input: {
  classId: string;
  rows: Array<{
    fullName: string;
    completionRate?: number;
    averageScore?: number;
    missedAssignments?: number;
    inactiveDays?: number;
    streakDays?: number;
  }>;
}): DemoState {
  return updateDemoState((current) => {
    const cleanedRows = input.rows
      .map((row) => ({
        fullName: row.fullName.trim(),
        completionRate: row.completionRate,
        averageScore: row.averageScore,
        missedAssignments: row.missedAssignments,
        inactiveDays: row.inactiveDays,
        streakDays: row.streakDays,
      }))
      .filter((row) => row.fullName.length > 0);

    if (cleanedRows.length === 0) {
      return current;
    }

    const byKey = new Map<string, DemoStudentInsight>();
    current.studentInsights.forEach((student) => {
      const key = `${student.classId}::${student.fullName.toLowerCase()}`;
      byKey.set(key, student);
    });

    cleanedRows.forEach((row, index) => {
      const key = `${input.classId}::${row.fullName.toLowerCase()}`;
      const existing = byKey.get(key);
      const base: DemoStudentInsight = existing ?? {
        id: `stu-${Date.now()}-${index}`,
        classId: input.classId,
        fullName: row.fullName,
        completionRate: 50,
        averageScore: 60,
        missedAssignments: 1,
        inactiveDays: 4,
        streakDays: 1,
      };

      byKey.set(key, {
        ...base,
        fullName: row.fullName,
        completionRate: Math.max(0, Math.min(100, row.completionRate ?? base.completionRate)),
        averageScore: Math.max(0, Math.min(100, row.averageScore ?? base.averageScore)),
        missedAssignments: Math.max(0, row.missedAssignments ?? base.missedAssignments),
        inactiveDays: Math.max(0, row.inactiveDays ?? base.inactiveDays),
        streakDays: Math.max(0, row.streakDays ?? base.streakDays),
      });
    });

    const studentInsights = Array.from(byKey.values());
    const classStudents = studentInsights.filter((student) => student.classId === input.classId);
    const classrooms = current.classrooms.map((classroom) => {
      if (classroom.id !== input.classId) {
        return classroom;
      }

      const completionAvg =
        classStudents.length === 0
          ? classroom.completionRate
          : Math.round(classStudents.reduce((sum, student) => sum + student.completionRate, 0) / classStudents.length);
      const scoreAvg =
        classStudents.length === 0
          ? classroom.averageScore
          : Math.round(classStudents.reduce((sum, student) => sum + student.averageScore, 0) / classStudents.length);
      const atRiskStudents = classStudents.filter((student) => getStudentRiskScore(student) >= 45).length;

      return {
        ...classroom,
        studentCount: Math.max(classroom.studentCount, classStudents.length),
        completionRate: completionAvg,
        averageScore: scoreAvg,
        atRiskStudents,
      };
    });

    return {
      ...current,
      studentInsights,
      classrooms,
    };
  });
}

export function setAssignmentStatus(input: {
  assignmentId: string;
  status: "active" | "closed";
}): DemoState {
  return updateDemoState((current) => ({
    ...current,
    assignments: current.assignments.map((assignment) =>
      assignment.id === input.assignmentId
        ? {
            ...assignment,
            status: input.status,
          }
        : assignment,
    ),
  }));
}

export function assignModeratorToReport(input: {
  reportId: string;
  moderator: string;
}): DemoState {
  return updateDemoState((current) => ({
    ...current,
    contentReports: current.contentReports.map((report) => {
      if (report.id !== input.reportId || report.status === "resolved") {
        return report;
      }

      return {
        ...report,
        assignedModerator: input.moderator,
        status: report.status === "open" ? "triaged" : report.status,
      };
    }),
  }));
}

export function updateContentReportStatus(input: {
  reportId: string;
  status: "triaged" | "in_review" | "action_required" | "resolved";
  note?: string;
}): DemoState {
  return updateDemoState((current) => {
    const contentReports: DemoContentReport[] = current.contentReports.map((report) => {
      if (report.id !== input.reportId) {
        return report;
      }

      return {
        ...report,
        status: input.status,
        resolutionNote: input.note ?? report.resolutionNote,
      };
    });

    return {
      ...current,
      contentReports,
      adminStats: {
        ...current.adminStats,
        reportsOpen: contentReports.filter((report) => report.status !== "resolved").length,
      },
    };
  });
}

export function resolveContentReport(reportId: string): DemoState {
  return updateContentReportStatus({
    reportId,
    status: "resolved",
    note: "Resolved by admin workflow",
  });
}

export function assignModeratorToReports(input: {
  reportIds: string[];
  moderator: string;
}): DemoState {
  return updateDemoState((current) => {
    const idSet = new Set(input.reportIds);
    const contentReports = current.contentReports.map((report) => {
      if (!idSet.has(report.id) || report.status === "resolved") {
        return report;
      }

      return {
        ...report,
        assignedModerator: input.moderator,
        status: report.status === "open" ? "triaged" : report.status,
      };
    });

    return {
      ...current,
      contentReports,
    };
  });
}

export function resolveContentReports(input: {
  reportIds: string[];
  note?: string;
}): DemoState {
  return updateDemoState((current) => {
    const idSet = new Set(input.reportIds);
    const contentReports = current.contentReports.map((report) => {
      if (!idSet.has(report.id)) {
        return report;
      }

      return {
        ...report,
        status: "resolved",
        resolutionNote: input.note ?? "Resolved by bulk admin workflow",
      };
    });

    return {
      ...current,
      contentReports,
      adminStats: {
        ...current.adminStats,
        reportsOpen: contentReports.filter((report) => report.status !== "resolved").length,
      },
    };
  });
}

export function restoreContentReportsSnapshot(input: {
  reports: DemoContentReport[];
}): DemoState {
  return updateDemoState((current) => {
    const byId = new Map(input.reports.map((report) => [report.id, report]));
    const contentReports = current.contentReports.map((report) => byId.get(report.id) ?? report);

    return {
      ...current,
      contentReports,
      adminStats: {
        ...current.adminStats,
        reportsOpen: contentReports.filter((report) => report.status !== "resolved").length,
      },
    };
  });
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

    const studyPoints = Math.max(
      6,
      Math.round((input.correctCount / Math.max(1, input.totalCards)) * 24),
    );

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
        pointsEarned:
          current.gameStats.pointsEarned +
          Math.max(5, Math.round((input.correctCount / totalReviewed) * 120)),
      },
      pointsLedger: {
        game: current.pointsLedger.game,
        miniTest: current.pointsLedger.miniTest,
        study: current.pointsLedger.study + studyPoints,
        total: current.pointsLedger.total + studyPoints,
      },
      xpHistory: appendXpHistory(current.xpHistory, {
        xp: studyPoints,
        source: "study",
      }),
      recentActivity: appendRecentActivity(current.recentActivity, {
        type: "study",
        titleVi: `SRS phiên học: ${input.correctCount}/${input.totalCards} thẻ`,
        titleEn: `SRS session: ${input.correctCount}/${input.totalCards} cards`,
        points: studyPoints,
      }),
    };
  });
}

export function recordGameResult(input: {
  scorePercent: number;
  points: number;
  perfect: boolean;
  gameType: DemoGameType;
}): DemoState {
  return updateDemoState((current) => {
    const gamesPlayed = current.gameStats.gamesPlayed + 1;
    const averageScore = Math.round(
      (current.gameStats.averageScore * current.gameStats.gamesPlayed + input.scorePercent) /
        gamesPlayed,
    );
    const pointsEarned = current.gameStats.pointsEarned + input.points;
    const challengeCompleted =
      !current.dailyChallenge.completedAt &&
      input.scorePercent >= current.dailyChallenge.targetScore;
    const bonusPoints = challengeCompleted ? current.dailyChallenge.rewardPoints : 0;
    const finalPoints = pointsEarned + bonusPoints;

    const nextGameStats = {
      gamesPlayed,
      averageScore,
      perfectScore: current.gameStats.perfectScore + (input.perfect ? 1 : 0),
      pointsEarned: finalPoints,
    };

    const totalGamePoints = current.pointsLedger.game + input.points + bonusPoints;
    const labels = getGameTypeLabel(input.gameType);

    return {
      ...current,
      gameStats: nextGameStats,
      pointsLedger: {
        game: totalGamePoints,
        miniTest: current.pointsLedger.miniTest,
        study: current.pointsLedger.study,
        total: current.pointsLedger.total + input.points + bonusPoints,
      },
      xpHistory: appendXpHistory(current.xpHistory, {
        xp: input.points + bonusPoints,
        source: "game",
      }),
      gameLeaderboard: syncCurrentPlayerLeaderboard({
        leaderboard: current.gameLeaderboard,
        playerName: current.profile.fullName,
        points: nextGameStats.pointsEarned,
        gamesPlayed: nextGameStats.gamesPlayed,
        streakDays: current.studyStats.streakDays,
      }),
      recentActivity: appendRecentActivity(current.recentActivity, {
        type: "game",
        gameType: input.gameType,
        titleVi: `Mini Game (${labels.vi}): đạt ${input.scorePercent}%`,
        titleEn: `Mini Game (${labels.en}): scored ${input.scorePercent}%`,
        points: input.points + bonusPoints,
      }),
      dailyChallenge: challengeCompleted
        ? {
            ...current.dailyChallenge,
            completedAt: new Date().toISOString(),
          }
        : current.dailyChallenge,
    };
  });
}
