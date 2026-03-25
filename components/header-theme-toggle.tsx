"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { getDemoLevelFromXp, readDemoState } from "@/lib/demo-store";
import { Moon, Sun } from "lucide-react";

export default function HeaderThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, t } = useLanguage();
  const [demoState] = useState(() => readDemoState());
  const isDark = resolvedTheme === "dark";
  const levelInfo = getDemoLevelFromXp(demoState.pointsLedger.total);
  const levelLabel = useMemo(() => {
    const labels = {
      beginner: "Beginner",
      learner: "Learner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      master: "Master",
    };

    return labels[levelInfo.key];
  }, [levelInfo.key]);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary sm:block">
        {locale === "vi" ? "Level" : "Level"}: {levelLabel}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={t("settings.toggleTheme")}
        title={t("settings.toggleTheme")}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}
