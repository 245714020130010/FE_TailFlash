"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import {
  createDefaultDemoState,
  readDemoState,
  updateDemoState,
  type DemoDeckLanguageCode,
} from "@/lib/demo-store";
import { BookOpen, Clock3, Copy, Download, Pencil, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

type DeckQuickTab = "all" | "due" | "active" | "new";
type DeckSort = "smart" | "due" | "name" | "progress";
type DeckLevel = "basic" | "intermediate" | "advanced";
type DeckManageMode = "create" | "edit";
type BeginnerState = {
  sessionCount: number;
  showAdvancedControls: boolean;
  isDismissed: boolean;
};
type DeckFormValues = {
  name: string;
  description: string;
  level: DeckLevel;
  sourceLanguage: DemoDeckLanguageCode;
  targetLanguage: DemoDeckLanguageCode;
  cards: Array<{
    term: string;
    definition: string;
  }>;
};

const BEGINNER_SESSION_LIMIT = 3;
const BEGINNER_SESSION_STORAGE_KEY = "tailflash-decks-visit-count";
const BEGINNER_DISMISSED_STORAGE_KEY = "tailflash-decks-beginner-dismissed";
const DEFAULT_DECK_FORM_VALUES: DeckFormValues = {
  name: "",
  description: "",
  level: "basic",
  sourceLanguage: "en",
  targetLanguage: "vi",
  cards: [
    { term: "", definition: "" },
    { term: "", definition: "" },
  ],
};

export default function DecksPageContent() {
  const { locale, t } = useLanguage();
  const defaultDemoState = useMemo(() => createDefaultDemoState(), []);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [quickTab, setQuickTab] = useState<DeckQuickTab>("all");
  const [sortBy, setSortBy] = useState<DeckSort>("smart");
  const [beginnerState, setBeginnerState] = useState<BeginnerState>(() => {
    if (typeof window === "undefined") {
      return {
        sessionCount: 0,
        showAdvancedControls: false,
        isDismissed: false,
      };
    }

    const currentRaw = window.localStorage.getItem(BEGINNER_SESSION_STORAGE_KEY);
    const dismissedRaw = window.localStorage.getItem(BEGINNER_DISMISSED_STORAGE_KEY);
    const currentCount = Number.parseInt(currentRaw ?? "0", 10);
    const safeCount = Number.isNaN(currentCount) ? 0 : Math.max(currentCount, 0);
    const isDismissed = dismissedRaw === "1";
    const nextCount = safeCount + 1;
    const showAdvancedControls = isDismissed || nextCount > BEGINNER_SESSION_LIMIT;

    window.localStorage.setItem(BEGINNER_SESSION_STORAGE_KEY, String(nextCount));

    return {
      sessionCount: nextCount,
      showAdvancedControls,
      isDismissed,
    };
  });
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
  const [demoState, setDemoState] = useState(defaultDemoState);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [manageMode, setManageMode] = useState<DeckManageMode>("create");
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [importingDeckId, setImportingDeckId] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDemoState(readDemoState());
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const createDeckSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("decks.createDeckErrorNameRequired")).max(80),
        description: z
          .string()
          .trim()
          .min(1, t("decks.createDeckErrorDescriptionRequired"))
          .max(260),
        level: z.enum(["basic", "intermediate", "advanced"]),
        sourceLanguage: z.enum(["vi", "en", "ja", "ko"]),
        targetLanguage: z.enum(["vi", "en", "ja", "ko"]),
        cards: z
          .array(
            z.object({
              term: z.string().trim().min(1, t("decks.createDeckErrorTermRequired")).max(120),
              definition: z
                .string()
                .trim()
                .min(1, t("decks.createDeckErrorDefinitionRequired"))
                .max(200),
            }),
          )
          .min(2, t("decks.createDeckErrorMinCards"))
          .max(60),
      })
        .refine((value) => value.sourceLanguage !== value.targetLanguage, {
          message: t("decks.sourceTargetSameError"),
          path: ["targetLanguage"],
        }),
    [t],
  );

  const createDeckForm = useForm<DeckFormValues>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: DEFAULT_DECK_FORM_VALUES,
  });

  const {
    fields: cardFields,
    append: appendCardField,
    remove: removeCardField,
  } = useFieldArray({
    control: createDeckForm.control,
    name: "cards",
  });

  const levelMessages = useMemo(
    () => ({
      basic: {
        vi: "Cơ bản",
        en: "Basic",
      },
      intermediate: {
        vi: "Trung bình",
        en: "Intermediate",
      },
      advanced: {
        vi: "Nâng cao",
        en: "Advanced",
      },
    }),
    [],
  );

  const languageLabels = useMemo(
    () => ({
      vi: t("decks.languageVi"),
      en: t("decks.languageEn"),
      ja: t("decks.languageJa"),
      ko: t("decks.languageKo"),
    }),
    [t],
  );

  const isBeginnerMode =
    !beginnerState.isDismissed &&
    beginnerState.sessionCount > 0 &&
    beginnerState.sessionCount <= BEGINNER_SESSION_LIMIT;
  const hideAdvancedControls = isBeginnerMode && !beginnerState.showAdvancedControls;

  const finishBeginnerMode = () => {
    window.localStorage.setItem(BEGINNER_DISMISSED_STORAGE_KEY, "1");
    setBeginnerState((current) => ({
      ...current,
      isDismissed: true,
      showAdvancedControls: true,
    }));
    toast.success(t("decks.beginnerFinishToast"));
  };

  const { decks, tabCounts } = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const mappedDecks = demoState.decks
      .map((deck) => {
        const progress = deck.cards === 0 ? 0 : deck.mastered / deck.cards;
        const status =
          deck.dueToday > 12
            ? t("decks.due")
            : progress > 0.6
              ? t("decks.active")
              : t("decks.new");

        return {
          ...deck,
          progress,
          level: locale === "vi" ? deck.levelVi : deck.levelEn,
          desc: locale === "vi" ? deck.descVi : deck.descEn,
          status,
        };
      });

    const queryFiltered = mappedDecks.filter((deck) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        deck.name.toLowerCase().includes(normalizedQuery) ||
        deck.level.toLowerCase().includes(normalizedQuery)
      );
    });

    const tabCounts = {
      all: queryFiltered.length,
      due: queryFiltered.filter((deck) => deck.dueToday > 0).length,
      active: queryFiltered.filter((deck) => deck.progress >= 0.45).length,
      new: queryFiltered.filter((deck) => deck.mastered <= Math.max(2, deck.cards * 0.2)).length,
    };

    const tabFiltered = queryFiltered.filter((deck) => {
      if (quickTab === "all") {
        return true;
      }

      if (quickTab === "due") {
        return deck.dueToday > 0;
      }

      if (quickTab === "active") {
        return deck.progress >= 0.45;
      }

      return deck.mastered <= Math.max(2, deck.cards * 0.2);
    });

    const sortedDecks = [...tabFiltered].sort((a, b) => {
      if (sortBy === "due") {
        return b.dueToday - a.dueToday;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "progress") {
        return b.progress - a.progress;
      }

      const dueScore = b.dueToday - a.dueToday;
      if (dueScore !== 0) {
        return dueScore;
      }

      return b.progress - a.progress;
    });

    return {
      decks: sortedDecks,
      tabCounts,
    };
  }, [demoState.decks, locale, query, quickTab, sortBy, t]);

  const quickTabs: Array<{ key: DeckQuickTab; label: string; count: number }> = [
    { key: "all", label: t("decks.quickTabAll"), count: tabCounts.all },
    { key: "due", label: t("decks.quickTabDue"), count: tabCounts.due },
    { key: "active", label: t("decks.quickTabActive"), count: tabCounts.active },
    { key: "new", label: t("decks.quickTabNew"), count: tabCounts.new },
  ];

  const clearFilters = () => {
    setQuery("");
    setQuickTab("all");
    setSortBy("smart");
  };

  const openCreateDeckDialog = () => {
    setManageMode("create");
    setEditingDeckId(null);
    createDeckForm.reset(DEFAULT_DECK_FORM_VALUES);
    setIsManageDialogOpen(true);
  };

  const openEditDeckDialog = (deckId: string) => {
    const targetDeck = demoState.decks.find((deck) => deck.id === deckId);
    if (!targetDeck || !targetDeck.isUserCreated) {
      return;
    }

    setManageMode("edit");
    setEditingDeckId(deckId);
    createDeckForm.reset({
      name: targetDeck.name,
      description: locale === "vi" ? targetDeck.descVi : targetDeck.descEn,
      level:
        targetDeck.levelEn === "Advanced"
          ? "advanced"
          : targetDeck.levelEn === "Intermediate"
            ? "intermediate"
            : "basic",
      sourceLanguage: targetDeck.sourceLanguage ?? "en",
      targetLanguage: targetDeck.targetLanguage ?? "vi",
      cards:
        targetDeck.customCards && targetDeck.customCards.length > 0
          ? targetDeck.customCards.map((card) => ({
              term: card.term,
              definition: card.definition,
            }))
          : [
              { term: "", definition: "" },
              { term: "", definition: "" },
            ],
    });
    setIsManageDialogOpen(true);
  };

  const upsertDeck = (values: DeckFormValues) => {
    const selectedLevel = levelMessages[values.level];

    const nextState = updateDemoState((current) => {
      const idSeed = current.decks.filter((deck) => deck.isUserCreated).length + 1;
      const fallbackDeckId = `deck-custom-${idSeed}`;
      const targetDeckId = manageMode === "edit" && editingDeckId ? editingDeckId : fallbackDeckId;
      const deckId = current.decks.some((deck) => deck.id === targetDeckId)
        ? targetDeckId
        : fallbackDeckId;
      const normalizedCards = values.cards.map((card, index) => ({
        id: `${deckId}-card-${index + 1}`,
        term: card.term.trim(),
        definition: card.definition.trim(),
      }));
      const deckPayload = {
        id: deckId,
        name: values.name.trim(),
        descVi: values.description.trim(),
        descEn: values.description.trim(),
        cards: normalizedCards.length,
        mastered: 0,
        reviewedToday: 0,
        levelVi: selectedLevel.vi,
        levelEn: selectedLevel.en,
        dueToday: normalizedCards.length,
        isUserCreated: true,
        customCards: normalizedCards,
        sourceLanguage: values.sourceLanguage,
        targetLanguage: values.targetLanguage,
      };

      const previousDeck = current.decks.find((deck) => deck.id === deckId);
      const nextDecks = previousDeck
        ? current.decks.map((deck) => (deck.id === deckId ? { ...deck, ...deckPayload } : deck))
        : [deckPayload, ...current.decks];
      const totalCardsDelta = normalizedCards.length - (previousDeck?.cards ?? 0);

      return {
        ...current,
        decks: nextDecks,
        selectedDeckId: deckId,
        studyStats: {
          ...current.studyStats,
          totalCards: Math.max(0, current.studyStats.totalCards + totalCardsDelta),
        },
      };
    });

    setDemoState(nextState);
    setIsManageDialogOpen(false);
    setEditingDeckId(null);
    setManageMode("create");
    createDeckForm.reset(DEFAULT_DECK_FORM_VALUES);
    toast.success(t(manageMode === "create" ? "decks.createDeckSuccessToast" : "decks.updateDeckSuccessToast"));
  };

  const deleteUserDeck = (deckId: string) => {
    const nextState = updateDemoState((current) => {
      const deckToDelete = current.decks.find((deck) => deck.id === deckId);
      if (!deckToDelete || !deckToDelete.isUserCreated) {
        return current;
      }

      const nextDecks = current.decks.filter((deck) => deck.id !== deckId);
      const fallbackSelectedDeck = nextDecks[0]?.id ?? "";

      return {
        ...current,
        decks: nextDecks,
        selectedDeckId: current.selectedDeckId === deckId ? fallbackSelectedDeck : current.selectedDeckId,
        studyStats: {
          ...current.studyStats,
          totalCards: Math.max(0, current.studyStats.totalCards - deckToDelete.cards),
        },
      };
    });

    setDemoState(nextState);
    setDeletingDeckId(null);
    toast.success(t("decks.deleteDeckSuccessToast"));
  };

  const duplicateUserDeck = (deckId: string) => {
    const nextState = updateDemoState((current) => {
      const sourceDeck = current.decks.find((deck) => deck.id === deckId);
      if (!sourceDeck || !sourceDeck.isUserCreated) {
        return current;
      }

      const nextSeed = current.decks.filter((deck) => deck.isUserCreated).length + 1;
      let newDeckId = `deck-custom-${nextSeed}`;
      let counter = nextSeed;

      while (current.decks.some((deck) => deck.id === newDeckId)) {
        counter += 1;
        newDeckId = `deck-custom-${counter}`;
      }

      const duplicatedCards = (sourceDeck.customCards ?? []).map((card, index) => ({
        id: `${newDeckId}-card-${index + 1}`,
        term: card.term,
        definition: card.definition,
      }));
      const duplicatedDeck = {
        ...sourceDeck,
        id: newDeckId,
        name: `${sourceDeck.name}${t("decks.copySuffix")}`,
        cards: duplicatedCards.length,
        dueToday: duplicatedCards.length,
        mastered: 0,
        reviewedToday: 0,
        customCards: duplicatedCards,
      };

      return {
        ...current,
        decks: [duplicatedDeck, ...current.decks],
        selectedDeckId: newDeckId,
        studyStats: {
          ...current.studyStats,
          totalCards: current.studyStats.totalCards + duplicatedCards.length,
        },
      };
    });

    setDemoState(nextState);
    toast.success(t("decks.duplicateDeckSuccessToast"));
  };

  const exportDeckCardsCsv = (deckId: string) => {
    const deck = demoState.decks.find((item) => item.id === deckId);
    if (!deck || !deck.isUserCreated) {
      toast.error(t("decks.importCsvOnlyUserDeck"));
      return;
    }

    const rows = deck.customCards ?? [];
    if (rows.length === 0) {
      toast.error(t("decks.importCsvNoValidRows"));
      return;
    }

    const escapeCsvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const header = "term,definition";
    const body = rows
      .map((card) => `${escapeCsvCell(card.term)},${escapeCsvCell(card.definition)}`)
      .join("\n");
    const csvContent = `${header}\n${body}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const fileName = `${deck.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "") || "deck"}-cards.csv`;
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(t("decks.exportDeckSuccessToast"));
  };

  const parseCsvRows = (csvText: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let index = 0; index < csvText.length; index += 1) {
      const char = csvText[index];
      const nextChar = csvText[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          index += 1;
        }
        currentRow.push(currentCell);
        if (currentRow.some((cell) => cell.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        continue;
      }

      currentCell += char;
    }

    currentRow.push(currentCell);
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow);
    }

    return rows;
  };

  const openImportCsvDialog = (deckId: string) => {
    setImportingDeckId(deckId);
    importFileInputRef.current?.click();
  };

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const targetDeckId = importingDeckId;
    event.target.value = "";

    if (!file || !targetDeckId) {
      return;
    }

    try {
      const csvText = await file.text();
      const parsedRows = parseCsvRows(csvText);
      if (parsedRows.length === 0) {
        toast.error(t("decks.importCsvNoValidRows"));
        return;
      }

      const [headerRow, ...contentRows] = parsedRows;
      const normalizedHeader = headerRow.map((cell) => cell.trim().toLowerCase());
      const termIndex = normalizedHeader.findIndex((cell) => cell === "term");
      const definitionIndex = normalizedHeader.findIndex((cell) => cell === "definition");

      if (termIndex < 0 || definitionIndex < 0) {
        toast.error(t("decks.importCsvMissingColumns"));
        return;
      }

      const importedCards = contentRows
        .map((row) => ({
          term: (row[termIndex] ?? "").trim(),
          definition: (row[definitionIndex] ?? "").trim(),
        }))
        .filter((card) => card.term.length > 0 && card.definition.length > 0);

      if (importedCards.length === 0) {
        toast.error(t("decks.importCsvNoValidRows"));
        return;
      }

      const nextState = updateDemoState((current) => {
        const targetDeck = current.decks.find((deck) => deck.id === targetDeckId);
        if (!targetDeck || !targetDeck.isUserCreated) {
          return current;
        }

        const existingCards = targetDeck.customCards ?? [];
        const mergedCards = [...existingCards, ...importedCards].map((card, index) => ({
          id: `${targetDeckId}-card-${index + 1}`,
          term: card.term,
          definition: card.definition,
        }));
        const totalCardsDelta = mergedCards.length - existingCards.length;

        return {
          ...current,
          decks: current.decks.map((deck) =>
            deck.id === targetDeckId
              ? {
                  ...deck,
                  cards: mergedCards.length,
                  dueToday: mergedCards.length,
                  customCards: mergedCards,
                  mastered: Math.min(deck.mastered, mergedCards.length),
                }
              : deck,
          ),
          studyStats: {
            ...current.studyStats,
            totalCards: current.studyStats.totalCards + totalCardsDelta,
          },
        };
      });

      setDemoState(nextState);
      toast.success(`${t("decks.importCsvSuccessToast")} (${importedCards.length})`);
    } catch {
      toast.error(t("decks.importCsvFileReadError"));
    } finally {
      setImportingDeckId(null);
    }
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
      <input
        ref={importFileInputRef}
        type="file"
        className="hidden"
        accept=".csv,text/csv"
        aria-label={t("decks.importDeckCsv")}
        title={t("decks.importDeckCsv")}
        onChange={handleImportCsv}
      />

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
          <Button className="bg-primary hover:bg-primary/90" type="button" onClick={openCreateDeckDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t("decks.createDeck")}
          </Button>
        </section>

        <Dialog
          open={isManageDialogOpen}
          onOpenChange={(open) => {
            setIsManageDialogOpen(open);
            if (!open) {
              setEditingDeckId(null);
              setManageMode("create");
              createDeckForm.reset(DEFAULT_DECK_FORM_VALUES);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t(manageMode === "create" ? "decks.createDialogTitle" : "decks.editDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t(manageMode === "create" ? "decks.createDialogDescription" : "decks.editDialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={createDeckForm.handleSubmit(upsertDeck)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="deck-name" className="text-sm font-medium">
                    {t("decks.deckNameLabel")}
                  </label>
                  <Input
                    id="deck-name"
                    placeholder={t("decks.deckNamePlaceholder")}
                    {...createDeckForm.register("name")}
                  />
                  {createDeckForm.formState.errors.name ? (
                    <p className="text-xs text-destructive">{createDeckForm.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="deck-description" className="text-sm font-medium">
                    {t("decks.deckDescriptionLabel")}
                  </label>
                  <Textarea
                    id="deck-description"
                    placeholder={t("decks.deckDescriptionPlaceholder")}
                    className="min-h-20"
                    {...createDeckForm.register("description")}
                  />
                  {createDeckForm.formState.errors.description ? (
                    <p className="text-xs text-destructive">
                      {createDeckForm.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deck-level" className="text-sm font-medium">
                    {t("decks.deckLevelLabel")}
                  </label>
                  <select
                    id="deck-level"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    {...createDeckForm.register("level")}
                  >
                    <option value="basic">{t("decks.deckLevelBasic")}</option>
                    <option value="intermediate">{t("decks.deckLevelIntermediate")}</option>
                    <option value="advanced">{t("decks.deckLevelAdvanced")}</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium">{t("decks.languagePairLabel")}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="source-language" className="text-xs font-medium">
                        {t("decks.sourceLanguageLabel")}
                      </label>
                      <select
                        id="source-language"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...createDeckForm.register("sourceLanguage")}
                      >
                        <option value="vi">{languageLabels.vi}</option>
                        <option value="en">{languageLabels.en}</option>
                        <option value="ja">{languageLabels.ja}</option>
                        <option value="ko">{languageLabels.ko}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="target-language" className="text-xs font-medium">
                        {t("decks.targetLanguageLabel")}
                      </label>
                      <select
                        id="target-language"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...createDeckForm.register("targetLanguage")}
                      >
                        <option value="vi">{languageLabels.vi}</option>
                        <option value="en">{languageLabels.en}</option>
                        <option value="ja">{languageLabels.ja}</option>
                        <option value="ko">{languageLabels.ko}</option>
                      </select>
                    </div>
                  </div>

                  {createDeckForm.formState.errors.targetLanguage ? (
                    <p className="text-xs text-destructive">{createDeckForm.formState.errors.targetLanguage.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{t("decks.cardsSectionTitle")}</h3>
                    <p className="text-xs text-muted-foreground">{t("decks.cardsSectionDescription")}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCardField({ term: "", definition: "" })}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    {t("decks.addCard")}
                  </Button>
                </div>

                <div className="space-y-3">
                  {cardFields.map((field, index) => (
                    <div key={field.id} className="rounded-md border border-border/70 bg-background p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={cardFields.length <= 2}
                          onClick={() => removeCardField(index)}
                          aria-label={`${t("decks.removeCard")} #${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="ml-1">{t("decks.removeCard")}</span>
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor={`card-term-${index}`} className="text-xs font-medium">
                            {t("decks.cardTermLabel")}
                          </label>
                          <Input
                            id={`card-term-${index}`}
                            placeholder={t("decks.cardTermPlaceholder")}
                            {...createDeckForm.register(`cards.${index}.term`)}
                          />
                          {createDeckForm.formState.errors.cards?.[index]?.term ? (
                            <p className="text-xs text-destructive">
                              {createDeckForm.formState.errors.cards[index]?.term?.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor={`card-definition-${index}`} className="text-xs font-medium">
                            {t("decks.cardDefinitionLabel")}
                          </label>
                          <Input
                            id={`card-definition-${index}`}
                            placeholder={t("decks.cardDefinitionPlaceholder")}
                            {...createDeckForm.register(`cards.${index}.definition`)}
                          />
                          {createDeckForm.formState.errors.cards?.[index]?.definition ? (
                            <p className="text-xs text-destructive">
                              {createDeckForm.formState.errors.cards[index]?.definition?.message}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {createDeckForm.formState.errors.cards?.message ? (
                  <p className="text-xs text-destructive">{createDeckForm.formState.errors.cards.message}</p>
                ) : null}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    createDeckForm.reset(DEFAULT_DECK_FORM_VALUES);
                    setIsManageDialogOpen(false);
                    setEditingDeckId(null);
                    setManageMode("create");
                  }}
                >
                  {t("decks.cancelCreateDeck")}
                </Button>
                <Button type="submit">{t(manageMode === "create" ? "decks.submitCreateDeck" : "decks.submitEditDeck")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <section className="mb-6 space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={t("decks.searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-card to-accent/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary/90">
                  {t("decks.quickToolsTitle")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("decks.quickToolsDescription")}
                </p>
                {isBeginnerMode && (
                  <p className="mt-2 text-xs text-primary">
                    {t("decks.beginnerModeLabel")} ({beginnerState.sessionCount}/{BEGINNER_SESSION_LIMIT})
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/study/session">
                  <Button size="sm">{t("decks.quickStudy")}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    {t("decks.quickDashboard")}
                  </Button>
                </Link>
                {isBeginnerMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      setBeginnerState((current) => ({
                        ...current,
                        showAdvancedControls: !current.showAdvancedControls,
                      }))
                    }
                  >
                    {beginnerState.showAdvancedControls
                      ? t("decks.beginnerKeepSimple")
                      : t("decks.beginnerShowAdvanced")}
                  </Button>
                )}
                {isBeginnerMode && (
                  <Button size="sm" variant="outline" type="button" onClick={finishBeginnerMode}>
                    {t("decks.beginnerFinishGuide")}
                  </Button>
                )}
              </div>
            </div>

            {hideAdvancedControls ? (
              <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-background/60 p-3 text-xs text-muted-foreground">
                {t("decks.beginnerModeDescription")}
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs
                  value={quickTab}
                  onValueChange={(value) => setQuickTab(value as DeckQuickTab)}
                  className="w-full"
                >
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                    {quickTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                      >
                        {tab.label}
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                          {tab.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex w-full items-center gap-2 lg:w-auto">
                  <Clock3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">{t("decks.sortLabel")}</span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as DeckSort)}>
                    <SelectTrigger className="w-full lg:w-48" size="sm" aria-label={t("decks.sortLabel")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smart">{t("decks.sortSmart")}</SelectItem>
                      <SelectItem value="due">{t("decks.sortDue")}</SelectItem>
                      <SelectItem value="progress">{t("decks.sortProgress")}</SelectItem>
                      <SelectItem value="name">{t("decks.sortName")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </Card>
        </section>

        {decks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <h3 className="text-lg font-semibold">{t("decks.emptyTitle")}</h3>
            <p className="max-w-xl text-sm text-muted-foreground">{t("decks.emptyDescription")}</p>
            <Button variant="outline" onClick={clearFilters}>
              {t("decks.clearFilters")}
            </Button>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {decks.map((deck) => (
              <Card key={deck.id} className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{deck.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {deck.cards} flashcards
                    </p>
                    {deck.isUserCreated ? (
                      <Badge variant="outline" className="mt-2 border-primary/40 text-primary">
                        {t("decks.createdByYou")}
                      </Badge>
                    ) : null}
                  </div>
                  <Badge variant="secondary">{deck.status}</Badge>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {t("decks.level")}: {deck.level}
                </div>

                {deck.sourceLanguage && deck.targetLanguage ? (
                  <p className="mb-3 text-xs text-muted-foreground">
                    {t("decks.languagePairDisplay")}: {languageLabels[deck.sourceLanguage]} - {languageLabels[deck.targetLanguage]}
                  </p>
                ) : null}

                {expandedDeckId === deck.id && (
                  <div className="mb-4 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    <p>{deck.desc}</p>
                    <p className="mt-1">
                      {locale === "vi" ? "Cần ôn hôm nay" : "Due today"}: {deck.dueToday}
                    </p>
                    <p>
                      {locale === "vi" ? "Đã nhớ" : "Mastered"}: {deck.mastered}/{deck.cards}
                    </p>

                    {deck.isUserCreated ? (
                      <div className="mt-3 rounded-md border border-border/70 bg-background/70 p-2">
                        <p className="text-xs font-semibold text-foreground">
                          {t("decks.customCardsLabel")}: {deck.customCards?.length ?? 0}
                        </p>

                        {deck.customCards && deck.customCards.length > 0 ? (
                          <ul className="mt-2 space-y-1.5 text-xs">
                            {deck.customCards.slice(0, 3).map((card) => (
                              <li key={card.id} className="rounded border border-border/60 bg-background px-2 py-1.5">
                                <p className="font-medium text-foreground">{card.term}</p>
                                <p>{card.definition}</p>
                              </li>
                            ))}
                            {deck.customCards.length > 3 ? (
                              <li className="text-muted-foreground">+{deck.customCards.length - 3}</li>
                            ) : null}
                          </ul>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">{t("decks.noCustomCards")}</p>
                        )}
                      </div>
                    ) : null}
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
                  {deck.isUserCreated && !hideAdvancedControls ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      type="button"
                      onClick={() => openEditDeckDialog(deck.id)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      {t("decks.manageDeck")}
                    </Button>
                  ) : null}
                  {!hideAdvancedControls && (
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
                  )}
                </div>

                {deck.isUserCreated ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Button
                      variant="ghost"
                      className="h-auto px-0 text-xs"
                      type="button"
                      onClick={() => duplicateUserDeck(deck.id)}
                    >
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      {t("decks.duplicateDeck")}
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto px-0 text-xs"
                      type="button"
                      onClick={() => exportDeckCardsCsv(deck.id)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      {t("decks.exportDeckCsv")}
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto px-0 text-xs"
                      type="button"
                      onClick={() => openImportCsvDialog(deck.id)}
                    >
                      <Upload className="mr-1 h-3.5 w-3.5" />
                      {t("decks.importDeckCsv")}
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto px-0 text-xs text-destructive hover:text-destructive"
                      type="button"
                      onClick={() => setDeletingDeckId(deck.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      {t("decks.deleteDeck")}
                    </Button>
                  </div>
                ) : null}
              </Card>
            ))}
          </section>
        )}

        <AlertDialog
          open={deletingDeckId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingDeckId(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("decks.deleteDialogTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("decks.deleteDialogDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("decks.cancelCreateDeck")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deletingDeckId) {
                    deleteUserDeck(deletingDeckId);
                  }
                }}
              >
                {t("decks.confirmDeleteDeck")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
