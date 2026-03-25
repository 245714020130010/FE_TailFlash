import type { Metadata } from "next";
import ProfileSettings from "@/components/profile-settings";

export const metadata: Metadata = {
  title: "Hồ sơ | TailFlash",
  description: "Quản lý thông tin tài khoản và tùy chọn học tập của bạn.",
};

export default function ProfilePage() {
  return <ProfileSettings />;
}
