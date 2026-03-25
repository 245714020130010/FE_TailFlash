"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/components/language-provider";
import { readDemoState, type DemoRole } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import {
  BellRing,
  BookOpenCheck,
  ChartLine,
  ChevronUp,
  ChevronsRight,
  FolderKanban,
  GraduationCap,
  ListChecks,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Rocket,
  ScrollText,
  Swords,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { subscribeDemoState } from "@/lib/demo-store";

const COLLAPSE_STORAGE_KEY = "tailflash-taskbar-collapsed";

type TaskbarShortcut = {
  href: string;
  labelVi: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
};

const commonShortcuts: TaskbarShortcut[] = [
  {
    href: "/",
    labelVi: "Trang chủ",
    labelEn: "Home",
    icon: Rocket,
  },
  {
    href: "/profile",
    labelVi: "Hồ sơ",
    labelEn: "Profile",
    icon: UserCog,
  },
];

const learnerShortcuts: TaskbarShortcut[] = [
  {
    href: "/dashboard",
    labelVi: "Bảng điều khiển",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/study",
    labelVi: "Học nhanh",
    labelEn: "Study",
    icon: BookOpenCheck,
  },
  {
    href: "/decks",
    labelVi: "Bộ thẻ",
    labelEn: "Decks",
    icon: FolderKanban,
  },
  {
    href: "/tests",
    labelVi: "Bài kiểm tra",
    labelEn: "Tests",
    icon: ScrollText,
  },
  {
    href: "/progress",
    labelVi: "Tiến độ",
    labelEn: "Progress",
    icon: ChartLine,
  },
  {
    href: "/games",
    labelVi: "Trò chơi",
    labelEn: "Games",
    icon: Swords,
  },
  {
    href: "/reminders",
    labelVi: "Nhắc nhở",
    labelEn: "Reminders",
    icon: BellRing,
  },
];

const teacherShortcuts: TaskbarShortcut[] = [
  {
    href: "/teacher/classes",
    labelVi: "Lớp học",
    labelEn: "Classes",
    icon: GraduationCap,
  },
  {
    href: "/teacher/assignments",
    labelVi: "Bài giao",
    labelEn: "Assignments",
    icon: ListChecks,
  },
  {
    href: "/tests",
    labelVi: "Bài kiểm tra",
    labelEn: "Tests",
    icon: ScrollText,
  },
  {
    href: "/decks",
    labelVi: "Bộ thẻ",
    labelEn: "Decks",
    icon: FolderKanban,
  },
  {
    href: "/dashboard",
    labelVi: "Bảng điều khiển",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/progress",
    labelVi: "Tiến độ",
    labelEn: "Progress",
    icon: ChartLine,
  },
];

const adminShortcuts: TaskbarShortcut[] = [
  {
    href: "/admin/moderation",
    labelVi: "Kiểm duyệt",
    labelEn: "Moderation",
    icon: ShieldCheck,
  },
  {
    href: "/admin/reports",
    labelVi: "Báo cáo",
    labelEn: "Reports",
    icon: ListChecks,
  },
  {
    href: "/teacher",
    labelVi: "Duyệt giáo viên",
    labelEn: "Teacher approvals",
    icon: GraduationCap,
  },
  {
    href: "/decks",
    labelVi: "Kiểm duyệt nội dung",
    labelEn: "Content moderation",
    icon: FolderKanban,
  },
  {
    href: "/dashboard",
    labelVi: "Bảng điều khiển",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/tests",
    labelVi: "Bài kiểm tra",
    labelEn: "Tests",
    icon: ListChecks,
  },
];

function getLabel(locale: "vi" | "en", labelVi: string, labelEn: string) {
  return locale === "en" ? labelEn : labelVi;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function RightTaskbar() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  });

  const demoRole = useSyncExternalStore(
    subscribeDemoState,
    () => readDemoState().profile.role,
    () => "learner",
  );

  const role = useMemo<DemoRole>(() => {
    return demoRole;
  }, [demoRole]);

  const shortcuts = useMemo(() => {
    if (role === "admin") {
      return [...commonShortcuts, ...adminShortcuts];
    }

    if (role === "teacher") {
      return [...commonShortcuts, ...teacherShortcuts];
    }

    return [...commonShortcuts, ...learnerShortcuts];
  }, [role]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const desktopAriaLabel = getLabel(locale, "Thanh tác vụ nhanh", "Quick taskbar");

  return (
    <>
      <aside
        className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 md:block"
        aria-label={desktopAriaLabel}
      >
        <div
          className={cn(
            "relative overflow-hidden border border-primary/25 bg-background/75 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl",
            collapsed ? "rounded-full" : "rounded-3xl",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.2),transparent_45%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.18),transparent_50%)]" />

          <div
            key={`${pathname}-${role}-${collapsed ? "collapsed" : "expanded"}`}
            className="relative animate-in fade-in-0 zoom-in-95 duration-300"
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={toggleCollapsed}
                    aria-label={getLabel(locale, "Mở rộng taskbar", "Expand taskbar")}
                  >
                    <ChevronsRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  {getLabel(locale, "Mở rộng taskbar", "Expand taskbar")}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="relative flex flex-col gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-2xl bg-background/80"
                      onClick={toggleCollapsed}
                      aria-label={getLabel(locale, "Thu gọn taskbar", "Collapse taskbar")}
                    >
                      <ChevronsRight className="h-5 w-5 rotate-180" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={10}>
                    {getLabel(locale, "Thu gọn taskbar", "Collapse taskbar")}
                  </TooltipContent>
                </Tooltip>

                <div className="my-1 h-px bg-border/80" />

                {shortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;
                  const active = isActivePath(pathname, shortcut.href);
                  const label = getLabel(locale, shortcut.labelVi, shortcut.labelEn);

                  return (
                    <Tooltip key={shortcut.href}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={active ? "default" : "ghost"}
                          size="icon"
                          asChild
                          className={cn(
                            "h-11 w-11 rounded-2xl transition-transform duration-200",
                            active && "scale-105",
                            !active && "hover:bg-primary/10 hover:text-primary",
                          )}
                          aria-label={label}
                        >
                          <Link href={shortcut.href}>
                            <Icon className="h-5 w-5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={10}>
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                <div className="my-1 h-px bg-border/80" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-2xl bg-background/80"
                      onClick={scrollToTop}
                      aria-label={getLabel(locale, "Cuộn lên đầu trang", "Back to top")}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={10}>
                    {getLabel(locale, "Lên đầu trang", "Back to top")}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg shadow-primary/20"
              aria-label={getLabel(locale, "Mở thanh tác vụ", "Open taskbar")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[84%] max-w-xs">
            <SheetHeader className="pr-10">
              <SheetTitle>
                {getLabel(locale, "Lối tắt nhanh", "Quick shortcuts")}
              </SheetTitle>
              <SheetDescription>
                {getLabel(
                  locale,
                  "Đi tới các khu vực chính chỉ với một chạm.",
                  "Jump to the key areas with a single tap.",
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-2 px-4 pb-4">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                const active = isActivePath(pathname, shortcut.href);
                const label = getLabel(locale, shortcut.labelVi, shortcut.labelEn);

                return (
                  <Button
                    key={shortcut.href}
                    asChild
                    variant={active ? "default" : "outline"}
                    className="justify-start gap-3"
                  >
                    <Link href={shortcut.href}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </Button>
                );
              })}

              <Button
                variant="secondary"
                className="justify-start gap-3"
                onClick={scrollToTop}
              >
                <ChevronUp className="h-4 w-4" />
                {getLabel(locale, "Lên đầu trang", "Back to top")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}