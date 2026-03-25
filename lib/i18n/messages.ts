import { authMessages } from "@/lib/i18n/modules/auth";
import { adminMessages } from "@/lib/i18n/modules/admin";
import { commonMessages } from "@/lib/i18n/modules/common";
import { dashboardMessages } from "@/lib/i18n/modules/dashboard";
import { decksMessages } from "@/lib/i18n/modules/decks";
import { gamesMessages } from "@/lib/i18n/modules/games";
import { landingMessages } from "@/lib/i18n/modules/landing";
import { onboardingMessages } from "@/lib/i18n/modules/onboarding";
import { profileMessages } from "@/lib/i18n/modules/profile";
import { progressMessages } from "@/lib/i18n/modules/progress";
import { settingsMessages } from "@/lib/i18n/modules/settings";
import { studyMessages } from "@/lib/i18n/modules/study";
import { teacherMessages } from "@/lib/i18n/modules/teacher";
import type { Locale, LocaleDictionary } from "@/lib/i18n/types";

const modules = {
  admin: adminMessages,
  auth: authMessages,
  common: commonMessages,
  dashboard: dashboardMessages,
  decks: decksMessages,
  games: gamesMessages,
  landing: landingMessages,
  onboarding: onboardingMessages,
  profile: profileMessages,
  progress: progressMessages,
  settings: settingsMessages,
  study: studyMessages,
  teacher: teacherMessages,
};

function buildLocaleMessages(locale: Locale) {
  return Object.entries(modules).reduce<Record<string, string>>((dict, [moduleName, localeDict]) => {
    Object.entries(localeDict[locale]).forEach(([key, value]) => {
      dict[`${moduleName}.${key}`] = value;
    });

    return dict;
  }, {});
}

export const messagesByLocale: Record<Locale, Record<string, string>> = {
  vi: buildLocaleMessages("vi"),
  en: buildLocaleMessages("en"),
};
