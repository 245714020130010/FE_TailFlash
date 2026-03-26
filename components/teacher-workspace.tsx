"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createAssignment,
  createDefaultDemoState,
  createClassroom,
  getStudentRiskScore,
  readDemoState,
  setAssignmentStatus,
  simulateStudentIntervention,
  simulateStudentInterventions,
  simulateAssignmentProgress,
  submitTeacherApplication,
  upsertStudentInsightsFromCsv,
} from "@/lib/demo-store";
import { useLanguage } from "@/components/language-provider";

const applicationSchema = z.object({
  note: z.string().min(20),
  documentsCount: z.coerce.number().min(1).max(10),
});

const classSchema = z.object({
  name: z.string().min(3),
  deckId: z.string().min(1),
});

const assignmentSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(5),
  dueDate: z.string().min(8),
});

type ApplicationFormInput = z.infer<typeof applicationSchema>;
type ClassFormInput = z.infer<typeof classSchema>;
type AssignmentFormInput = z.infer<typeof assignmentSchema>;
type SuggestedActionType = "booster" | "reminder" | "mandatory_test";

interface CsvPreviewState {
  fileName: string;
  headers: string[];
  rows: string[][];
  mapping: {
    className: number;
    studentName: number;
    completionRate: number;
    averageScore: number;
    missedAssignments: number;
    inactiveDays: number;
    streakDays: number;
  };
}

export type TeacherWorkspaceSection = "all" | "classes" | "assignments";

interface TeacherWorkspaceProps {
  initialSection?: TeacherWorkspaceSection;
}

export default function TeacherWorkspace({
  initialSection = "all",
}: TeacherWorkspaceProps) {
  const { locale, t } = useLanguage();
  const defaultDemoState = useMemo(() => createDefaultDemoState(), []);
  const [demoState, setDemoState] = useState(defaultDemoState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedInsightClassId, setSelectedInsightClassId] = useState(
    defaultDemoState.classrooms[0]?.id ?? "",
  );
  const importCsvRef = useRef<HTMLInputElement | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewState | null>(null);
  const role = demoState.profile.role;
  const canManageTeaching = role === "teacher" || role === "admin";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextState = readDemoState();
      setDemoState(nextState);
      setSelectedInsightClassId((current) => current || nextState.classrooms[0]?.id || "");
      setIsHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const applicationForm = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      note: demoState.teacherApplication.note,
      documentsCount: Math.max(1, demoState.teacherApplication.documentsCount),
    },
  });

  const classForm = useForm<ClassFormInput>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      deckId: demoState.selectedDeckId,
    },
  });

  const assignmentForm = useForm<AssignmentFormInput>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      classId: demoState.classrooms[0]?.id ?? "",
      title: "",
      dueDate: demoState.assignments[0]?.dueDate.slice(0, 10) ?? "2026-12-31",
    },
  });

  const pendingAssignments = useMemo(
    () =>
      demoState.assignments.filter(
        (item) => item.status === "active" && item.submittedCount < item.assignedCount,
      ),
    [demoState.assignments],
  );

  const classAnalytics = useMemo(() => {
    const classesOnTrack = demoState.classrooms.filter((room) => room.completionRate >= 70).length;
    const classesAtRisk = demoState.classrooms.filter((room) => room.atRiskStudents > 0).length;
    const totalAtRiskStudents = demoState.classrooms.reduce((sum, room) => sum + room.atRiskStudents, 0);

    return {
      classesOnTrack,
      classesAtRisk,
      totalAtRiskStudents,
    };
  }, [demoState.classrooms]);

  const showAll = initialSection === "all";
  const showClasses = (showAll || initialSection === "classes") && canManageTeaching;
  const showAssignments = (showAll || initialSection === "assignments") && canManageTeaching;

  const insightClassId = selectedInsightClassId || demoState.classrooms[0]?.id || "";
  const insightStudents = useMemo(
    () => demoState.studentInsights.filter((student) => student.classId === insightClassId),
    [demoState.studentInsights, insightClassId],
  );

  const insightRiskSummary = useMemo(() => {
    return insightStudents.reduce(
      (acc, student) => {
        const score = getStudentRiskScore(student);
        if (score >= 75) {
          acc.high += 1;
        } else if (score >= 45) {
          acc.medium += 1;
        } else {
          acc.low += 1;
        }

        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }, [insightStudents]);

  const suggestedActions = useMemo(() => {
    return insightStudents.map((student) => {
      const riskScore = getStudentRiskScore(student);
      const actions: SuggestedActionType[] = [];

      if (student.completionRate < 70 || riskScore >= 70) {
        actions.push("booster");
      }
      if (student.inactiveDays >= 4 || student.missedAssignments >= 2) {
        actions.push("reminder");
      }
      if (student.averageScore < 65 || riskScore >= 85) {
        actions.push("mandatory_test");
      }

      return {
        student,
        actions,
        riskScore,
      };
    });
  }, [insightStudents]);

  const totalSuggestedActionCount = useMemo(
    () => suggestedActions.reduce((sum, item) => sum + item.actions.length, 0),
    [suggestedActions],
  );

  const csvDuplicateMappingIndexes = useMemo(() => {
    if (!csvPreview) {
      return new Set<number>();
    }

    const counts = new Map<number, number>();
    Object.values(csvPreview.mapping).forEach((index) => {
      if (index < 0) {
        return;
      }

      counts.set(index, (counts.get(index) ?? 0) + 1);
    });

    const duplicated = new Set<number>();
    counts.forEach((count, index) => {
      if (count > 1) {
        duplicated.add(index);
      }
    });

    return duplicated;
  }, [csvPreview]);

  const hasDuplicateCsvMapping = csvDuplicateMappingIndexes.size > 0;
  const canConfirmCsvImport =
    Boolean(csvPreview) &&
    (csvPreview?.mapping.studentName ?? -1) >= 0 &&
    !hasDuplicateCsvMapping;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("teacher.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("teacher.loadingWorkspace")}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!showAll && !canManageTeaching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("teacher.deniedTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {t("teacher.deniedDescription")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/teacher">
                  <Button>{t("teacher.backTeacher")}</Button>
                </Link>
                <Link href="/study">
                  <Button variant="outline">{t("teacher.backStudy")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const submitApplication = (values: ApplicationFormInput) => {
    const nextState = submitTeacherApplication(values);
    setDemoState(nextState);
    toast.success(t("teacher.requestSubmitted"));
  };

  const submitClass = (values: ClassFormInput) => {
    const nextState = createClassroom(values);
    setDemoState(nextState);
    classForm.reset({ name: "", deckId: values.deckId });
    toast.success(t("teacher.classCreated"));
  };

  const submitAssignment = (values: AssignmentFormInput) => {
    const nextState = createAssignment(values);
    setDemoState(nextState);
    assignmentForm.reset({
      classId: values.classId,
      title: "",
      dueDate: values.dueDate,
    });
    toast.success(t("teacher.assignmentCreated"));
  };

  const handleSimulateProgress = (assignmentId: string) => {
    const nextState = simulateAssignmentProgress({
      assignmentId,
      submittedDelta: 3,
      averageScoreDelta: 2,
    });
    setDemoState(nextState);
    toast.success(t("teacher.simulatedProgress"));
  };

  const handleAssignmentStatus = (assignmentId: string, status: "active" | "closed") => {
    const nextState = setAssignmentStatus({ assignmentId, status });
    setDemoState(nextState);
    toast.success(status === "closed" ? t("teacher.assignmentClosed") : t("teacher.assignmentReopened"));
  };

  const handleStudentIntervention = (studentId: string) => {
    const nextState = simulateStudentIntervention({ studentId });
    setDemoState(nextState);
    toast.success(t("teacher.interventionApplied"));
  };

  const getSuggestedActionPayload = (action: SuggestedActionType) => {
    if (action === "booster") {
      return {
        completionDelta: 8,
        scoreDelta: 3,
        missedAssignmentsDelta: 0,
        inactiveDaysDelta: -1,
        streakDelta: 1,
      };
    }

    if (action === "reminder") {
      return {
        completionDelta: 2,
        scoreDelta: 1,
        missedAssignmentsDelta: -1,
        inactiveDaysDelta: -3,
        streakDelta: 2,
      };
    }

    return {
      completionDelta: 4,
      scoreDelta: 6,
      missedAssignmentsDelta: -1,
      inactiveDaysDelta: -1,
      streakDelta: 1,
    };
  };

  const combineActionPayloads = (actions: SuggestedActionType[]) =>
    actions.reduce(
      (acc, action) => {
        const next = getSuggestedActionPayload(action);
        return {
          completionDelta: acc.completionDelta + next.completionDelta,
          scoreDelta: acc.scoreDelta + next.scoreDelta,
          missedAssignmentsDelta: acc.missedAssignmentsDelta + next.missedAssignmentsDelta,
          inactiveDaysDelta: acc.inactiveDaysDelta + next.inactiveDaysDelta,
          streakDelta: acc.streakDelta + next.streakDelta,
        };
      },
      {
        completionDelta: 0,
        scoreDelta: 0,
        missedAssignmentsDelta: 0,
        inactiveDaysDelta: 0,
        streakDelta: 0,
      },
    );

  const handleApplySuggestedAction = (studentId: string, action: SuggestedActionType) => {
    const payload = getSuggestedActionPayload(action);
    const nextState = simulateStudentIntervention({
      studentId,
      ...payload,
    });
    setDemoState(nextState);
    toast.success(
      action === "booster"
        ? t("teacher.actionBoosterApplied")
        : action === "reminder"
          ? t("teacher.actionReminderApplied")
          : t("teacher.actionMandatoryTestApplied"),
    );
  };

  const handleApplyAllForStudent = (studentId: string, actions: SuggestedActionType[]) => {
    if (actions.length === 0) {
      toast.error(t("teacher.noSuggestedActions"));
      return;
    }

    const combined = combineActionPayloads(actions);
    const nextState = simulateStudentIntervention({
      studentId,
      ...combined,
    });
    setDemoState(nextState);
    toast.success(t("teacher.applyAllForStudentDone"));
  };

  const handleApplyAllForClass = () => {
    const updates = suggestedActions
      .filter((item) => item.actions.length > 0)
      .map((item) => ({
        studentId: item.student.id,
        ...combineActionPayloads(item.actions),
      }));

    if (updates.length === 0) {
      toast.error(t("teacher.noSuggestedActions"));
      return;
    }

    const nextState = simulateStudentInterventions({ updates });
    setDemoState(nextState);
    toast.success(t("teacher.applyAllForClassDone").replace("{count}", String(updates.length)));
  };

  const parseCsvLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  };

  const parseNumberOrUndefined = (value: string | undefined): number | undefined => {
    if (!value) {
      return undefined;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const handleImportInsightsCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      toast.error(t("teacher.csvImportInvalid"));
      return;
    }

    const headerCells = parseCsvLine(lines[0]).map((item) => item.toLowerCase());
    const headerIndex = {
      className: headerCells.indexOf("class_name"),
      studentName: headerCells.indexOf("student_name"),
      completionRate: headerCells.indexOf("completion_rate"),
      averageScore: headerCells.indexOf("average_score"),
      missedAssignments: headerCells.indexOf("missed_assignments"),
      inactiveDays: headerCells.indexOf("inactive_days"),
      streakDays: headerCells.indexOf("streak_days"),
    };

    if (headerIndex.studentName < 0) {
      toast.error(t("teacher.csvImportInvalid"));
      return;
    }

    setCsvPreview({
      fileName: file.name,
      headers: headerCells,
      rows: lines.slice(1).map((line) => parseCsvLine(line)),
      mapping: {
        className: headerIndex.className,
        studentName: headerIndex.studentName,
        completionRate: headerIndex.completionRate,
        averageScore: headerIndex.averageScore,
        missedAssignments: headerIndex.missedAssignments,
        inactiveDays: headerIndex.inactiveDays,
        streakDays: headerIndex.streakDays,
      },
    });
  };

  const updateCsvMapping = (field: keyof CsvPreviewState["mapping"], value: string) => {
    if (!csvPreview) {
      return;
    }

    setCsvPreview({
      ...csvPreview,
      mapping: {
        ...csvPreview.mapping,
        [field]: Number(value),
      },
    });
  };

  const handleConfirmImportCsv = () => {
    if (!csvPreview) {
      return;
    }

    if (csvPreview.mapping.studentName < 0) {
      toast.error(t("teacher.csvImportInvalid"));
      return;
    }

    const grouped = new Map<string, Array<{
      fullName: string;
      completionRate?: number;
      averageScore?: number;
      missedAssignments?: number;
      inactiveDays?: number;
      streakDays?: number;
    }>>();
    const selectedClass = demoState.classrooms.find((room) => room.id === insightClassId);

    csvPreview.rows.forEach((row) => {
      const className = csvPreview.mapping.className >= 0 ? row[csvPreview.mapping.className] : undefined;
      const studentName = row[csvPreview.mapping.studentName] ?? "";
      const classByName = className
        ? demoState.classrooms.find((room) => room.name.toLowerCase() === className.toLowerCase())
        : undefined;
      const classId = classByName?.id ?? selectedClass?.id;

      if (!classId || !studentName.trim()) {
        return;
      }

      const rows = grouped.get(classId) ?? [];
      rows.push({
        fullName: studentName,
        completionRate:
          csvPreview.mapping.completionRate >= 0
            ? parseNumberOrUndefined(row[csvPreview.mapping.completionRate])
            : undefined,
        averageScore:
          csvPreview.mapping.averageScore >= 0
            ? parseNumberOrUndefined(row[csvPreview.mapping.averageScore])
            : undefined,
        missedAssignments:
          csvPreview.mapping.missedAssignments >= 0
            ? parseNumberOrUndefined(row[csvPreview.mapping.missedAssignments])
            : undefined,
        inactiveDays:
          csvPreview.mapping.inactiveDays >= 0
            ? parseNumberOrUndefined(row[csvPreview.mapping.inactiveDays])
            : undefined,
        streakDays:
          csvPreview.mapping.streakDays >= 0
            ? parseNumberOrUndefined(row[csvPreview.mapping.streakDays])
            : undefined,
      });
      grouped.set(classId, rows);
    });

    if (grouped.size === 0) {
      toast.error(t("teacher.csvImportNoRows"));
      return;
    }

    grouped.forEach((rows, classId) => {
      upsertStudentInsightsFromCsv({ classId, rows });
    });

    const refreshed = readDemoState();
    setDemoState(refreshed);
    setCsvPreview(null);
    toast.success(t("teacher.csvImported"));
  };

  const exportInsightsCsv = () => {
    const selectedClass = demoState.classrooms.find((item) => item.id === insightClassId);
    if (!selectedClass || insightStudents.length === 0) {
      toast.error(t("teacher.noInsightData"));
      return;
    }

    const lines = [
      [
        "class_name",
        "student_name",
        "completion_rate",
        "average_score",
        "missed_assignments",
        "inactive_days",
        "streak_days",
        "risk_score",
      ],
      ...insightStudents.map((student) => [
        selectedClass.name,
        student.fullName,
        student.completionRate.toString(),
        student.averageScore.toString(),
        student.missedAssignments.toString(),
        student.inactiveDays.toString(),
        student.streakDays.toString(),
        getStudentRiskScore(student).toString(),
      ]),
    ];

    const csv = lines
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `class-insights-${selectedClass.id}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(t("teacher.csvExported"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{locale === "vi" ? "Teacher Workspace" : "Teacher Workspace"}</h1>
            <p className="text-sm text-muted-foreground">
              {t("teacher.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline">{locale === "vi" ? "Dashboard" : "Dashboard"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3">
        {showAll ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("teacher.approvalTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-card/70 p-4 text-sm">
                <p>
                  {t("teacher.statusLabel")}: <strong>{demoState.teacherApplication.status}</strong>
                </p>
                {demoState.teacherApplication.submittedAt ? (
                  <p className="text-muted-foreground">
                    {t("teacher.submittedAtLabel")}: {new Date(demoState.teacherApplication.submittedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                  </p>
                ) : null}
              </div>

              <form className="space-y-3" onSubmit={applicationForm.handleSubmit(submitApplication)}>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="teacher-note">
                    {t("teacher.experienceLabel")}
                  </label>
                  <textarea
                    id="teacher-note"
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2"
                    {...applicationForm.register("note")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="teacher-docs">
                    {t("teacher.documentsLabel")}
                  </label>
                  <input
                    id="teacher-docs"
                    type="number"
                    min={1}
                    max={10}
                    className="h-10 w-full rounded-md border border-input bg-background px-3"
                    {...applicationForm.register("documentsCount")}
                  />
                </div>
                <Button type="submit">{t("teacher.submitRequest")}</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("teacher.quickStats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <p>{t("teacher.currentRole")}</p>
              <p className="text-2xl font-bold">{role}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p>{t("teacher.classroomsCount")}</p>
              <p className="text-2xl font-bold">{demoState.classrooms.length}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p>{t("teacher.openAssignments")}</p>
              <p className="text-2xl font-bold">{pendingAssignments.length}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p>{t("teacher.totalLearners")}</p>
              <p className="text-2xl font-bold">
                {demoState.classrooms.reduce((sum, room) => sum + room.studentCount, 0)}
              </p>
            </div>
            {!canManageTeaching ? (
              <div className="rounded-md border border-dashed p-3 text-muted-foreground">
                {t("teacher.deniedNeedApproval")}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {showClasses ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("teacher.createClassroom")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={classForm.handleSubmit(submitClass)}>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3"
                    placeholder={t("teacher.classNamePlaceholder")}
                    {...classForm.register("name")}
                  />
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3"
                    {...classForm.register("deckId")}
                  >
                    {demoState.decks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" className="w-full">
                    {t("teacher.create")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("teacher.classroomList")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoState.classrooms.map((room) => (
                  <div key={room.id} className="rounded-md border bg-card/70 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{room.name}</p>
                      <p className="text-muted-foreground">{room.studentCount} {t("teacher.learners")}</p>
                    </div>
                    <p>
                      {t("teacher.completionRate")}: {room.completionRate}%
                    </p>
                    <p>{t("teacher.avgScore")}: {room.averageScore}%</p>
                    <p>{t("teacher.atRisk")}: {room.atRiskStudents}</p>
                    <p>{t("teacher.weeklyActiveRate")}: {room.weeklyActiveRate}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("teacher.analyticsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <p>{t("teacher.classesOnTrack")}</p>
                  <p className="text-2xl font-bold">{classAnalytics.classesOnTrack}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p>{t("teacher.classesAtRisk")}</p>
                  <p className="text-2xl font-bold">{classAnalytics.classesAtRisk}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p>{t("teacher.totalAtRiskStudents")}</p>
                  <p className="text-2xl font-bold">{classAnalytics.totalAtRiskStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t("teacher.studentInsightsTitle")}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={insightClassId}
                    onChange={(event) => setSelectedInsightClassId(event.target.value)}
                    aria-label={t("teacher.classLabel")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {demoState.classrooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" onClick={exportInsightsCsv}>
                    {t("teacher.exportCsv")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => importCsvRef.current?.click()}>
                    {t("teacher.importCsv")}
                  </Button>
                  <input
                    ref={importCsvRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleImportInsightsCsv}
                    aria-label={t("teacher.importCsv")}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md bg-muted p-3">
                    <p>{t("teacher.highRiskLearners")}</p>
                    <p className="text-2xl font-bold">{insightRiskSummary.high}</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p>{t("teacher.mediumRiskLearners")}</p>
                    <p className="text-2xl font-bold">{insightRiskSummary.medium}</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p>{t("teacher.lowRiskLearners")}</p>
                    <p className="text-2xl font-bold">{insightRiskSummary.low}</p>
                  </div>
                </div>

                {insightStudents.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    {t("teacher.noInsightData")}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/70 text-left">
                          <tr>
                            <th className="px-3 py-2 font-medium">{t("teacher.studentName")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.completionRate")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.avgScore")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.missedAssignments")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.inactiveDays")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.riskScore")}</th>
                            <th className="px-3 py-2 font-medium">{t("teacher.actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {insightStudents.map((student) => {
                            const riskScore = getStudentRiskScore(student);
                            const riskLabel =
                              riskScore >= 75
                                ? t("teacher.riskHigh")
                                : riskScore >= 45
                                  ? t("teacher.riskMedium")
                                  : t("teacher.riskLow");
                            const riskVariant =
                              riskScore >= 75
                                ? "destructive"
                                : riskScore >= 45
                                  ? "secondary"
                                  : "outline";

                            return (
                              <tr key={student.id} className="border-t">
                                <td className="px-3 py-2">{student.fullName}</td>
                                <td className="px-3 py-2">{student.completionRate}%</td>
                                <td className="px-3 py-2">{student.averageScore}%</td>
                                <td className="px-3 py-2">{student.missedAssignments}</td>
                                <td className="px-3 py-2">{student.inactiveDays}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={riskVariant}>{riskLabel}</Badge>
                                    <span>{riskScore}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <Button size="sm" variant="outline" onClick={() => handleStudentIntervention(student.id)}>
                                    {t("teacher.applyIntervention")}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 rounded-md border bg-card/60 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{t("teacher.suggestedActionsTitle")}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleApplyAllForClass}
                          disabled={totalSuggestedActionCount === 0}
                        >
                          <span>{t("teacher.applyAllForClass")}</span>
                          <Badge variant="secondary" className="ml-2">
                            {t("teacher.totalSuggestedActions")}: {totalSuggestedActionCount}
                          </Badge>
                        </Button>
                      </div>
                      {suggestedActions.length === 0 ? (
                        <p className="text-muted-foreground">{t("teacher.noSuggestedActions")}</p>
                      ) : (
                        suggestedActions.map((item) => (
                          <div key={item.student.id} className="rounded-md border bg-background p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="font-medium">{item.student.fullName}</p>
                              <Badge variant={item.riskScore >= 75 ? "destructive" : item.riskScore >= 45 ? "secondary" : "outline"}>
                                {t("teacher.riskScore")}: {item.riskScore}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.actions.includes("booster") ? (
                                <Button size="sm" variant="outline" onClick={() => handleApplySuggestedAction(item.student.id, "booster")}>
                                  {t("teacher.actionBooster")}
                                </Button>
                              ) : null}
                              {item.actions.includes("reminder") ? (
                                <Button size="sm" variant="outline" onClick={() => handleApplySuggestedAction(item.student.id, "reminder")}>
                                  {t("teacher.actionReminder")}
                                </Button>
                              ) : null}
                              {item.actions.includes("mandatory_test") ? (
                                <Button size="sm" variant="outline" onClick={() => handleApplySuggestedAction(item.student.id, "mandatory_test")}>
                                  {t("teacher.actionMandatoryTest")}
                                </Button>
                              ) : null}
                              {item.actions.length > 1 ? (
                                <Button size="sm" onClick={() => handleApplyAllForStudent(item.student.id, item.actions)}>
                                  {t("teacher.applyAllForStudent")}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {csvPreview ? (
                      <div className="space-y-3 rounded-md border bg-card/60 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{t("teacher.csvPreviewTitle")}: {csvPreview.fileName}</p>
                          <p className="text-muted-foreground">
                            {t("teacher.csvPreviewRows").replace("{count}", String(csvPreview.rows.length))}
                          </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {([
                            ["className", t("teacher.csvMapClassName")],
                            ["studentName", t("teacher.csvMapStudentName")],
                            ["completionRate", t("teacher.csvMapCompletion")],
                            ["averageScore", t("teacher.csvMapAvgScore")],
                            ["missedAssignments", t("teacher.csvMapMissed")],
                            ["inactiveDays", t("teacher.csvMapInactive")],
                            ["streakDays", t("teacher.csvMapStreak")],
                          ] as Array<[keyof CsvPreviewState["mapping"], string]>).map(([field, label]) => (
                            <label key={field} className="space-y-1">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <select
                                value={String(csvPreview.mapping[field])}
                                onChange={(event) => updateCsvMapping(field, event.target.value)}
                                className={`h-9 w-full rounded-md border bg-background px-3 ${
                                  csvPreview.mapping[field] >= 0 && csvDuplicateMappingIndexes.has(csvPreview.mapping[field])
                                    ? "border-destructive"
                                    : "border-input"
                                }`}
                                aria-label={label}
                              >
                                {field !== "studentName" ? <option value="-1">{t("teacher.csvMapIgnore")}</option> : null}
                                {csvPreview.headers.map((header, index) => (
                                  <option key={`${header}-${index}`} value={String(index)}>
                                    {header}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>

                        {csvPreview.mapping.studentName < 0 ? (
                          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                            {t("teacher.csvMapStudentRequired")}
                          </div>
                        ) : null}

                        {hasDuplicateCsvMapping ? (
                          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                            {t("teacher.csvMapDuplicateColumns")}
                          </div>
                        ) : null}

                        <div className="overflow-x-auto rounded-md border">
                          <table className="min-w-full text-xs">
                            <thead className="bg-muted/70 text-left">
                              <tr>
                                {csvPreview.headers.map((header, index) => (
                                  <th key={`${header}-${index}`} className="px-2 py-1.5 font-medium">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.rows.slice(0, 5).map((row, rowIndex) => (
                                <tr key={`preview-row-${rowIndex}`} className="border-t">
                                  {csvPreview.headers.map((_, colIndex) => (
                                    <td key={`preview-cell-${rowIndex}-${colIndex}`} className="px-2 py-1.5">
                                      {row[colIndex] ?? ""}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={handleConfirmImportCsv}
                            disabled={!canConfirmCsvImport}
                          >
                            {t("teacher.csvConfirmImport")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setCsvPreview(null)}>
                            {t("teacher.csvCancelImport")}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {showAssignments ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("teacher.assignmentTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 md:grid-cols-3" onSubmit={assignmentForm.handleSubmit(submitAssignment)}>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3"
                  {...assignmentForm.register("classId")}
                >
                  {demoState.classrooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <input
                  className="h-10 rounded-md border border-input bg-background px-3"
                  placeholder={t("teacher.assignmentPlaceholder")}
                  {...assignmentForm.register("title")}
                />
                <input
                  type="date"
                  className="h-10 rounded-md border border-input bg-background px-3"
                  {...assignmentForm.register("dueDate")}
                />
                <Button type="submit" className="md:col-span-3">
                  {t("teacher.createAssignment")}
                </Button>
              </form>

              <div className="space-y-3">
                {demoState.assignments.map((assignment) => {
                  const classroom = demoState.classrooms.find((item) => item.id === assignment.classId);
                  const progress = assignment.assignedCount === 0
                    ? 0
                    : Math.round((assignment.submittedCount / assignment.assignedCount) * 100);

                  return (
                    <div key={assignment.id} className="rounded-md border bg-card/70 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{assignment.title}</p>
                        <p className="text-muted-foreground">
                          {t("teacher.dueLabel")}: {new Date(assignment.dueDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        {t("teacher.classLabel")}: {classroom?.name ?? "-"}
                      </p>
                      <p>
                        {assignment.submittedCount}/{assignment.assignedCount} {t("teacher.submittedProgress")} ({progress}%)
                      </p>
                      <p>{t("teacher.assignmentStatus")}: {assignment.status === "active" ? t("teacher.statusActive") : t("teacher.statusClosed")}</p>
                      <p>{t("teacher.avgAssignmentScore")}: {assignment.averageScore}%</p>
                      <p>{t("teacher.lateSubmissions")}: {assignment.lateSubmissions}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSimulateProgress(assignment.id)}
                          disabled={assignment.status === "closed"}
                        >
                          {t("teacher.simulateSubmission")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAssignmentStatus(
                              assignment.id,
                              assignment.status === "active" ? "closed" : "active",
                            )
                          }
                        >
                          {assignment.status === "active" ? t("teacher.closeAssignment") : t("teacher.reopenAssignment")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
