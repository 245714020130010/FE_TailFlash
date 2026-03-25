"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";
import { Globe, Languages, Moon, Settings2, Sun } from "lucide-react";

export default function GlobalSettings() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label={t("settings.title")}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{t("settings.title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {t("settings.theme")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={setTheme}
          >
            <DropdownMenuRadioItem value="light">
              <Sun className="h-4 w-4" />
              {t("settings.themeLight")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon className="h-4 w-4" />
              {t("settings.themeDark")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Globe className="h-4 w-4" />
              {t("settings.themeSystem")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {t("settings.language")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => setLocale(value as "vi" | "en")}
          >
            <DropdownMenuRadioItem value="vi">
              <Languages className="h-4 w-4" />
              {t("settings.languageVi")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">
              <Languages className="h-4 w-4" />
              {t("settings.languageEn")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
