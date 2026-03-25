"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { useLanguage } from "@/components/language-provider";
import {
  getDemoLevelFromXp,
  readDemoState,
  resetDemoState,
  saveStudyNote,
  signOutAllDemoSessions,
  updateDemoState,
  updateNotificationSettings,
} from "@/lib/demo-store";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const initialDemoState = readDemoState();
  const [name, setName] = useState(initialDemoState.profile.fullName);
  const [email, setEmail] = useState(initialDemoState.profile.email);
  const [phone, setPhone] = useState(initialDemoState.profile.phone);
  const [bio, setBio] = useState(
    locale === "vi"
      ? initialDemoState.profile.bioVi
      : initialDemoState.profile.bioEn,
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState(
    initialDemoState.notifications,
  );
  const [studyNotes, setStudyNotes] = useState(initialDemoState.studyNotes);
  const [selectedNoteDeckId, setSelectedNoteDeckId] = useState(
    initialDemoState.selectedDeckId,
  );
  const [noteDraft, setNoteDraft] = useState(
    initialDemoState.studyNotes[initialDemoState.selectedDeckId] ?? "",
  );
  const [sessionProvider, setSessionProvider] = useState(
    initialDemoState.session.provider,
  );
  const levelInfo = getDemoLevelFromXp(initialDemoState.pointsLedger.total);
  const levelLabels = {
    beginner: locale === "vi" ? "Người mới" : "Beginner",
    learner: locale === "vi" ? "Người học" : "Learner",
    intermediate: locale === "vi" ? "Trung cấp" : "Intermediate",
    advanced: locale === "vi" ? "Nâng cao" : "Advanced",
    master: locale === "vi" ? "Bậc thầy" : "Master",
  } as const;

  const providerBadge = useMemo(() => {
    if (sessionProvider === "google") {
      return {
        label: t("profile.providerGoogle"),
        className: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
      };
    }

    if (sessionProvider === "facebook") {
      return {
        label: t("profile.providerFacebook"),
        className: "border border-blue-500/30 bg-blue-500/10 text-blue-700",
      };
    }

    return {
      label: t("profile.providerPassword"),
      className: "border border-border bg-muted text-muted-foreground",
    };
  }, [sessionProvider, t]);

  const canUpdatePassword = useMemo(() => {
    return (
      currentPassword.trim().length > 0 &&
      newPassword.trim().length >= 8 &&
      newPassword === confirmPassword
    );
  }, [confirmPassword, currentPassword, newPassword]);

  const handleSaveProfile = () => {
    updateDemoState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        fullName: name,
        email,
        phone,
        bioVi: locale === "vi" ? bio : current.profile.bioVi,
        bioEn: locale === "en" ? bio : current.profile.bioEn,
      },
      session: {
        ...current.session,
        email,
      },
    }));
    toast.success(locale === "vi" ? "Đã lưu hồ sơ demo" : "Demo profile saved");
  };

  const handleUpdatePassword = () => {
    if (!canUpdatePassword) {
      toast.error(
        locale === "vi"
          ? "Kiểm tra lại mật khẩu mới và xác nhận"
          : "Please check your new password and confirmation",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(
      locale === "vi"
        ? "Mật khẩu demo đã được cập nhật"
        : "Demo password has been updated",
    );
  };

  const handleSaveNotifications = () => {
    const nextState = updateNotificationSettings(notifications);
    setNotifications(nextState.notifications);
    toast.success(t("profile.notificationsSaved"));
  };

  const handleSignOutAll = () => {
    const nextState = signOutAllDemoSessions();
    setSessionProvider(nextState.session.provider);
    toast.info(
      locale === "vi"
        ? "Đã đăng xuất tất cả phiên demo"
        : "All demo sessions have been signed out",
    );
  };

  const handleDeckNoteChange = (deckId: string) => {
    setSelectedNoteDeckId(deckId);
    setNoteDraft(studyNotes[deckId] ?? "");
  };

  const handleSaveDeckNote = () => {
    if (!selectedNoteDeckId) {
      toast.error(t("profile.noDecks"));
      return;
    }

    const nextState = saveStudyNote({
      deckId: selectedNoteDeckId,
      note: noteDraft.trim(),
    });
    setStudyNotes(nextState.studyNotes);
    toast.success(t("profile.noteSaved"));
  };

  const handleDeleteAccount = () => {
    const confirmStepOne = window.confirm(t("profile.deleteConfirmStep1"));

    if (!confirmStepOne) {
      toast.info(t("profile.deleteAbort"));
      return;
    }

    const confirmation = window.prompt(t("profile.deleteConfirmStep2"));
    if ((confirmation ?? "").trim().toUpperCase() !== "DELETE") {
      toast.error(t("profile.deleteAbort"));
      return;
    }

    const freshState = resetDemoState();
    setName(freshState.profile.fullName);
    setEmail(freshState.profile.email);
    setPhone(freshState.profile.phone);
    setBio(locale === "vi" ? freshState.profile.bioVi : freshState.profile.bioEn);
    setNotifications(freshState.notifications);
    setStudyNotes(freshState.studyNotes);
    setSelectedNoteDeckId(freshState.selectedDeckId);
    setNoteDraft(freshState.studyNotes[freshState.selectedDeckId] ?? "");
    setSessionProvider(freshState.session.provider);
    toast.success(t("profile.deleteSuccess"));
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("profile.subtitle")}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs">
              <span className="text-muted-foreground">{t("profile.providerLabel")}:</span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${providerBadge.className}`}>
                {providerBadge.label}
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {locale === "vi" ? "Cấp độ" : "Level"}: {levelLabels[levelInfo.key]}
              </span>
            </div>
          </div>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t("profile.profile")}</TabsTrigger>
            <TabsTrigger value="password">{t("profile.password")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("profile.notifications")}
            </TabsTrigger>
            <TabsTrigger value="notes">{t("profile.notes")}</TabsTrigger>
            <TabsTrigger value="appearance">
              {t("profile.appearance")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.profileInfo")}</CardTitle>
                <CardDescription>
                  {locale === "vi"
                    ? "Cập nhật thông tin cá nhân của bạn."
                    : "Update your personal information."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-name" className="text-sm">
                      {t("profile.fullName")}
                    </label>
                    <input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-sm">
                      {t("profile.email")}
                    </label>
                    <input
                      id="profile-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="text-sm">
                      {t("profile.phone")}
                    </label>
                    <input
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-bio" className="text-sm">
                      {t("profile.bio")}
                    </label>
                    <input
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleSaveProfile}>
                  {t("profile.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.password")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label htmlFor="current-password" className="sr-only">
                  {locale === "vi" ? "Mật khẩu hiện tại" : "Current password"}
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder={
                    locale === "vi" ? "Mật khẩu hiện tại" : "Current password"
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <label htmlFor="new-password" className="sr-only">
                  {locale === "vi" ? "Mật khẩu mới" : "New password"}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={
                    locale === "vi" ? "Mật khẩu mới" : "New password"
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <label htmlFor="confirm-password" className="sr-only">
                  {locale === "vi"
                    ? "Nhập lại mật khẩu mới"
                    : "Confirm new password"}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={
                    locale === "vi"
                      ? "Nhập lại mật khẩu mới"
                      : "Confirm new password"
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <Button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={!canUpdatePassword}
                >
                  {t("profile.updatePassword")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.notifications")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  {
                    key: "dailyReminder" as const,
                    label: t("profile.dailyReminder"),
                  },
                  {
                    key: "weeklyReport" as const,
                    label: t("profile.weeklyReport"),
                  },
                  {
                    key: "streakWarning" as const,
                    label: t("profile.streakWarning"),
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between rounded-md bg-muted p-3"
                  >
                    {item.label}
                    <input
                      type="checkbox"
                      aria-label={item.label}
                      checked={notifications[item.key]}
                      onChange={(event) =>
                        setNotifications((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                ))}
                <Button
                  type="button"
                  onClick={handleSaveNotifications}
                >
                  {t("profile.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.notesTitle")}</CardTitle>
                <CardDescription>{t("profile.notesSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="deck-notes-select" className="text-sm">
                    {t("profile.selectDeck")}
                  </label>
                  <select
                    id="deck-notes-select"
                    value={selectedNoteDeckId}
                    onChange={(event) => handleDeckNoteChange(event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    disabled={initialDemoState.decks.length === 0}
                  >
                    {initialDemoState.decks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="deck-note-content" className="text-sm">
                    {t("profile.notes")}
                  </label>
                  <textarea
                    id="deck-note-content"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder={t("profile.notePlaceholder")}
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2"
                    disabled={initialDemoState.decks.length === 0}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleSaveDeckNote}
                  disabled={initialDemoState.decks.length === 0}
                >
                  {t("profile.saveChanges")}
                </Button>

                {initialDemoState.decks.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("profile.noDecks")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.appearance")}</CardTitle>
                <CardDescription>
                  {locale === "vi"
                    ? "Dùng nút đổi theme trên header để chuyển nhanh."
                    : "Use the header theme button for quick switch."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {locale === "vi"
                    ? "Các tùy chọn theme và ngôn ngữ chung được quản lý toàn cục."
                    : "Theme and language settings are managed globally."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("profile.dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive"
              type="button"
              onClick={handleSignOutAll}
            >
              {t("profile.logoutAll")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive"
              type="button"
              onClick={handleDeleteAccount}
            >
              {t("profile.deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
