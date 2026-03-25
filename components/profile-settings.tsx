"use client";

import { useMemo, useState } from "react";
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
import { readDemoState, updateDemoState } from "@/lib/demo-store";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { locale, t } = useLanguage();
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
    toast.success(locale === "vi" ? "Da luu ho so demo" : "Demo profile saved");
  };

  const handleUpdatePassword = () => {
    if (!canUpdatePassword) {
      toast.error(
        locale === "vi"
          ? "Kiem tra lai mat khau moi va xac nhan"
          : "Please check your new password and confirmation",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(
      locale === "vi"
        ? "Mat khau demo da duoc cap nhat"
        : "Demo password has been updated",
    );
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
          </div>
          <HeaderThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{t("profile.profile")}</TabsTrigger>
            <TabsTrigger value="password">{t("profile.password")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("profile.notifications")}
            </TabsTrigger>
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
                  locale === "vi" ? "Nhắc học hằng ngày" : "Daily reminder",
                  locale === "vi" ? "Báo cáo hằng tuần" : "Weekly report",
                  locale === "vi" ? "Cảnh báo mất streak" : "Streak warning",
                ].map((label) => (
                  <label
                    key={label}
                    className="flex items-center justify-between rounded-md bg-muted p-3"
                  >
                    {label}
                    <input
                      type="checkbox"
                      aria-label={label}
                      defaultChecked
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    toast.success(
                      locale === "vi"
                        ? "Da luu tuy chon thong bao"
                        : "Notification preferences saved",
                    )
                  }
                >
                  {t("profile.saveChanges")}
                </Button>
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
              onClick={() =>
                toast.info(
                  locale === "vi"
                    ? "Da dang xuat tat ca phien demo"
                    : "All demo sessions have been signed out",
                )
              }
            >
              {t("profile.logoutAll")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive"
              type="button"
              onClick={() =>
                toast.warning(
                  locale === "vi"
                    ? "Che do demo: tai khoan khong bi xoa that"
                    : "Demo mode: account is not actually deleted",
                )
              }
            >
              {t("profile.deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
