"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  assignModeratorToReport,
  assignModeratorToReports,
  type DemoContentReport,
  readDemoState,
  resolveContentReport,
  resolveContentReports,
  restoreContentReportsSnapshot,
  reviewTeacherApplication,
  updateContentReportStatus,
} from "@/lib/demo-store";
import { useLanguage } from "@/components/language-provider";

const PROGRESS_WIDTH_CLASSES = [
  "w-0",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-full",
] as const;

export type AdminWorkspaceSection = "all" | "moderation" | "reports";

interface AdminWorkspaceProps {
  initialSection?: AdminWorkspaceSection;
}

export default function AdminWorkspace({
  initialSection = "all",
}: AdminWorkspaceProps) {
  const { locale, t } = useLanguage();
  const [demoState, setDemoState] = useState(() => readDemoState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportSeverityFilter, setReportSeverityFilter] = useState("all");
  const [reportSlaFilter, setReportSlaFilter] = useState("all");
  const [reportSortBy, setReportSortBy] = useState("priority_desc");
  const [queueStatusFilter, setQueueStatusFilter] = useState("all");
  const [queueSortBy, setQueueSortBy] = useState("submitted_desc");
  const [lastBulkResolvedSnapshot, setLastBulkResolvedSnapshot] = useState<DemoContentReport[] | null>(null);
  const [undoExpiresAt, setUndoExpiresAt] = useState<number | null>(null);
  const [undoNow, setUndoNow] = useState(() => Date.now());
  const [policyNow] = useState(() => Date.now());
  const role = demoState.profile.role;
  const showAll = initialSection === "all";
  const showModeration = showAll || initialSection === "moderation";
  const showReports = showAll || initialSection === "reports";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDemoState(readDemoState());
      setIsHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!undoExpiresAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      const now = Date.now();
      setUndoNow(now);
      const remaining = Math.max(0, Math.ceil((undoExpiresAt - now) / 1000));

      if (remaining <= 0) {
        setLastBulkResolvedSnapshot(null);
        setUndoExpiresAt(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [undoExpiresAt]);

  const undoSecondsLeft = undoExpiresAt
    ? Math.max(0, Math.ceil((undoExpiresAt - undoNow) / 1000))
    : 0;
  const undoProgressPercent = Math.max(0, Math.min(100, (undoSecondsLeft / 30) * 100));
  const undoProgressWidthClass = PROGRESS_WIDTH_CLASSES[Math.round(undoProgressPercent / 5)];

  const handleReview = (requestId: string, status: "approved" | "rejected") => {
    const nextState = reviewTeacherApplication({
      requestId,
      status,
      reviewedBy: "admin.demo@tailflash.local",
    });
    setDemoState(nextState);
    toast.success(
      status === "approved" ? t("admin.approvedToast") : t("admin.rejectedToast"),
    );
  };

  const handleResolveReport = (reportId: string) => {
    const nextState = resolveContentReport(reportId);
    setDemoState(nextState);
    toast.success(t("admin.reportResolved"));
  };

  const handleAssignModerator = (reportId: string) => {
    const nextState = assignModeratorToReport({
      reportId,
      moderator: "mod.operations@tailflash.local",
    });
    setDemoState(nextState);
    toast.success(t("admin.reportAssigned"));
  };

  const handleMoveToReview = (reportId: string) => {
    const nextState = updateContentReportStatus({
      reportId,
      status: "in_review",
      note: "Review in progress by moderation team.",
    });
    setDemoState(nextState);
    toast.success(t("admin.reportInReview"));
  };

  const handleRequestAction = (reportId: string) => {
    const nextState = updateContentReportStatus({
      reportId,
      status: "action_required",
      note: "Deck owner needs to update examples and definitions.",
    });
    setDemoState(nextState);
    toast.success(t("admin.reportNeedsAction"));
  };

  const triagedCount = demoState.contentReports.filter((item) => item.status === "triaged").length;
  const inReviewCount = demoState.contentReports.filter((item) => item.status === "in_review").length;
  const actionRequiredCount = demoState.contentReports.filter((item) => item.status === "action_required").length;
  const resolvedCount = demoState.contentReports.filter((item) => item.status === "resolved").length;

  const queueItems = useMemo(() => {
    const filtered = demoState.adminQueue.filter((item) => {
      if (queueStatusFilter === "all") {
        return true;
      }

      return item.status === queueStatusFilter;
    });

    return [...filtered].sort((a, b) => {
      const left = new Date(a.submittedAt).getTime();
      const right = new Date(b.submittedAt).getTime();
      if (queueSortBy === "submitted_asc") {
        return left - right;
      }

      return right - left;
    });
  }, [demoState.adminQueue, queueStatusFilter, queueSortBy]);

  const reportItems = useMemo(() => {
    const toHours = (reportedAt: string) => (policyNow - new Date(reportedAt).getTime()) / (1000 * 60 * 60);
    const getSlaTargetHours = (severity: "low" | "medium" | "high") => {
      if (severity === "high") {
        return 8;
      }
      if (severity === "medium") {
        return 24;
      }

      return 48;
    };
    const getPriorityScore = (input: {
      severity: "low" | "medium" | "high";
      status: "open" | "triaged" | "in_review" | "action_required" | "resolved";
      elapsedHours: number;
    }) => {
      const severityBase = input.severity === "high" ? 70 : input.severity === "medium" ? 45 : 20;
      const ageBoost = Math.min(25, Math.floor(input.elapsedHours));
      const statusBoost =
        input.status === "open"
          ? 20
          : input.status === "action_required"
            ? 14
            : input.status === "triaged"
              ? 9
              : input.status === "in_review"
                ? 4
                : -100;

      return severityBase + ageBoost + statusBoost;
    };
    const getPriorityTier = (score: number) => {
      if (score >= 90) {
        return "P1";
      }
      if (score >= 70) {
        return "P2";
      }
      if (score >= 50) {
        return "P3";
      }

      return "P4";
    };

    const withPolicy = demoState.contentReports.map((report) => {
      const elapsedHours = toHours(report.reportedAt);
      const slaTargetHours = getSlaTargetHours(report.severity);
      const slaRemainingHours = Math.round(slaTargetHours - elapsedHours);
      const priorityScore = getPriorityScore({
        severity: report.severity,
        status: report.status,
        elapsedHours,
      });
      const priorityTier = getPriorityTier(priorityScore);
      const slaState =
        report.status === "resolved"
          ? "resolved"
          : slaRemainingHours < 0
            ? "breached"
            : slaRemainingHours <= 4
              ? "due_soon"
              : "within_sla";

      return {
        ...report,
        elapsedHours,
        slaTargetHours,
        slaRemainingHours,
        priorityScore,
        priorityTier,
        slaState,
      };
    });

    const filtered = withPolicy.filter((report) => {
      if (reportStatusFilter !== "all" && report.status !== reportStatusFilter) {
        return false;
      }

      if (reportSeverityFilter !== "all" && report.severity !== reportSeverityFilter) {
        return false;
      }

      if (reportSlaFilter !== "all" && report.slaState !== reportSlaFilter) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (reportSortBy === "priority_desc") {
        return b.priorityScore - a.priorityScore;
      }
      if (reportSortBy === "newest") {
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
      if (reportSortBy === "oldest") {
        return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
      }

      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [
    demoState.contentReports,
    reportSeverityFilter,
    reportSlaFilter,
    reportSortBy,
    reportStatusFilter,
    policyNow,
  ]);

  const actionableFilteredReportIds = reportItems
    .filter((report) => report.status !== "resolved")
    .map((report) => report.id);

  const handleBulkAssignByFilter = () => {
    if (actionableFilteredReportIds.length === 0) {
      toast.error(t("admin.bulkNoReports"));
      return;
    }

    const nextState = assignModeratorToReports({
      reportIds: actionableFilteredReportIds,
      moderator: "mod.operations@tailflash.local",
    });
    setDemoState(nextState);
    toast.success(
      t("admin.bulkAssignDone").replace("{count}", String(actionableFilteredReportIds.length)),
    );
  };

  const handleBulkResolveByFilter = () => {
    if (actionableFilteredReportIds.length === 0) {
      toast.error(t("admin.bulkNoReports"));
      return;
    }

    const snapshot = demoState.contentReports.filter((report) => actionableFilteredReportIds.includes(report.id));
    setLastBulkResolvedSnapshot(snapshot);
    setUndoExpiresAt(Date.now() + 30_000);

    const nextState = resolveContentReports({
      reportIds: actionableFilteredReportIds,
      note: "Resolved by filtered bulk action",
    });
    setDemoState(nextState);
    toast.success(
      t("admin.bulkResolveDone").replace("{count}", String(actionableFilteredReportIds.length)),
    );
  };

  const handleUndoBulkResolve = () => {
    if (!lastBulkResolvedSnapshot || lastBulkResolvedSnapshot.length === 0) {
      toast.error(t("admin.bulkUndoUnavailable"));
      return;
    }

    const nextState = restoreContentReportsSnapshot({
      reports: lastBulkResolvedSnapshot,
    });
    setDemoState(nextState);
    setLastBulkResolvedSnapshot(null);
    setUndoExpiresAt(null);
    toast.success(t("admin.bulkUndoDone"));
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("admin.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("admin.loadingWorkspace")}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("admin.deniedTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {t("admin.deniedDescription")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/study">
                  <Button>{t("admin.backStudy")}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">{t("admin.backDashboard")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.subtitle")}
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

      <main className="mx-auto space-y-6 px-4 py-8 sm:max-w-6xl sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.teacherApprovals")}
              </p>
              <p className="text-2xl font-bold">{demoState.adminStats.pendingTeacherApprovals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.openReports")}
              </p>
              <p className="text-2xl font-bold">{demoState.adminStats.reportsOpen}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.activeUsers")}
              </p>
              <p className="text-2xl font-bold">{demoState.adminStats.activeUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("admin.moderationTasks")}
              </p>
              <p className="text-2xl font-bold">{demoState.adminStats.deckModerations}</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.moderationOverview")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-muted p-3">
                <p>{t("admin.triagedCount")}</p>
                <p className="text-2xl font-bold">{triagedCount}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p>{t("admin.inReviewCount")}</p>
                <p className="text-2xl font-bold">{inReviewCount}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p>{t("admin.actionRequiredCount")}</p>
                <p className="text-2xl font-bold">{actionRequiredCount}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p>{t("admin.resolvedCount")}</p>
                <p className="text-2xl font-bold">{resolvedCount}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {showModeration ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.approvalQueue")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={queueStatusFilter}
                    onChange={(event) => setQueueStatusFilter(event.target.value)}
                    aria-label={t("admin.filterAllStatuses")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">{t("admin.filterAllStatuses")}</option>
                    <option value="pending">{t("admin.filterPending")}</option>
                    <option value="approved">{t("admin.filterApproved")}</option>
                    <option value="rejected">{t("admin.filterRejected")}</option>
                  </select>
                  <select
                    value={queueSortBy}
                    onChange={(event) => setQueueSortBy(event.target.value)}
                    aria-label={t("admin.sortNewest")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="submitted_desc">{t("admin.sortNewest")}</option>
                    <option value="submitted_asc">{t("admin.sortOldest")}</option>
                  </select>
                </div>

                {queueItems.map((request) => (
                  <div key={request.id} className="rounded-md border bg-card/70 p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold">{request.applicantName}</p>
                      <Badge variant={request.status === "pending" ? "secondary" : "outline"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{request.email}</p>
                    <p className="text-muted-foreground">{request.specialty}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.submittedLabel")}: {new Date(request.submittedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                    </p>
                    {request.status === "pending" ? (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => handleReview(request.id, "approved")}>
                          {t("admin.approve")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReview(request.id, "rejected")}>
                          {t("admin.reject")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {showReports ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.contentReports")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <select
                    value={reportStatusFilter}
                    onChange={(event) => setReportStatusFilter(event.target.value)}
                    aria-label={t("admin.filterAllStatuses")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">{t("admin.filterAllStatuses")}</option>
                    <option value="open">open</option>
                    <option value="triaged">triaged</option>
                    <option value="in_review">in_review</option>
                    <option value="action_required">action_required</option>
                    <option value="resolved">resolved</option>
                  </select>
                  <select
                    value={reportSeverityFilter}
                    onChange={(event) => setReportSeverityFilter(event.target.value)}
                    aria-label={t("admin.filterAllSeverities")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">{t("admin.filterAllSeverities")}</option>
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                  <select
                    value={reportSlaFilter}
                    onChange={(event) => setReportSlaFilter(event.target.value)}
                    aria-label={t("admin.filterAllSla")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">{t("admin.filterAllSla")}</option>
                    <option value="breached">{t("admin.slaBreached")}</option>
                    <option value="due_soon">{t("admin.slaDueSoon")}</option>
                    <option value="within_sla">{t("admin.slaWithin")}</option>
                    <option value="resolved">{t("admin.slaResolved")}</option>
                  </select>
                  <select
                    value={reportSortBy}
                    onChange={(event) => setReportSortBy(event.target.value)}
                    aria-label={t("admin.sortPriority")}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="priority_desc">{t("admin.sortPriority")}</option>
                    <option value="newest">{t("admin.sortNewest")}</option>
                    <option value="oldest">{t("admin.sortOldest")}</option>
                    <option value="severity_desc">{t("admin.sortSeverity")}</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleBulkAssignByFilter}>
                    {t("admin.bulkAssignByFilter")}
                  </Button>
                  <Button size="sm" onClick={handleBulkResolveByFilter}>
                    {t("admin.bulkResolveByFilter")}
                  </Button>
                  {lastBulkResolvedSnapshot && lastBulkResolvedSnapshot.length > 0 && undoSecondsLeft > 0 ? (
                    <Button size="sm" variant="outline" onClick={handleUndoBulkResolve}>
                      {t("admin.bulkUndoResolve")}
                    </Button>
                  ) : null}
                </div>

                {lastBulkResolvedSnapshot && lastBulkResolvedSnapshot.length > 0 && undoSecondsLeft > 0 ? (
                  <div className="space-y-1 rounded-md border bg-muted/40 p-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t("admin.bulkUndoCountdown").replace("{seconds}", String(undoSecondsLeft))}</span>
                      <span>{undoSecondsLeft}s</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                      <div className={`h-full bg-destructive transition-all duration-1000 ${undoProgressWidthClass}`} />
                    </div>
                  </div>
                ) : null}

                {reportItems.map((report) => (
                  <div key={report.id} className="rounded-md border bg-card/70 p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold">{report.deckName}</p>
                      <Badge variant={report.status === "resolved" ? "secondary" : "destructive"}>{report.status}</Badge>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={report.priorityTier === "P1" ? "destructive" : report.priorityTier === "P2" ? "secondary" : "outline"}>
                        {t("admin.priorityLabel")} {report.priorityTier}
                      </Badge>
                      <Badge
                        variant={
                          report.slaState === "breached"
                            ? "destructive"
                            : report.slaState === "due_soon"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {report.slaState === "breached"
                          ? t("admin.slaBreached")
                          : report.slaState === "due_soon"
                            ? t("admin.slaDueSoon")
                            : report.slaState === "resolved"
                              ? t("admin.slaResolved")
                              : t("admin.slaWithin")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{report.reason}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.severityLabel")}: {report.severity}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.slaTarget")}: {report.slaTargetHours}h
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.slaRemaining")}: {report.slaRemainingHours}h
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.autoPriorityScore")}: {report.priorityScore}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.reporterLabel")}: {report.reporterName}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("admin.statusLabel")}: {report.status}
                    </p>
                    <p className="text-xs text-muted-foreground">{report.resolutionNote}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.status !== "resolved" ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleAssignModerator(report.id)}>
                            {t("admin.assignModerator")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleMoveToReview(report.id)}>
                            {t("admin.markInReview")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestAction(report.id)}>
                            {t("admin.requestAction")}
                          </Button>
                          <Button size="sm" onClick={() => handleResolveReport(report.id)}>
                            {t("admin.markResolved")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </section>
      </main>
    </div>
  );
}
