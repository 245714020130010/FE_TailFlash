import { authMessages } from "@/lib/i18n/modules/auth";
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
import type { Locale, LocaleDictionary } from "@/lib/i18n/types";

const modules: Record<string, LocaleDictionary> = {
  common: commonMessages,
  settings: settingsMessages,
  landing: landingMessages,
  study: studyMessages,
  auth: authMessages,
  dashboard: dashboardMessages,
  games: gamesMessages,
  profile: profileMessages,
  progress: progressMessages,
  decks: decksMessages,
  onboarding: onboardingMessages,
};

function buildLocaleMessages(locale: Locale) {
  const dict: Record<string, string> = {};

  Object.entries(modules).forEach(([moduleName, localeDict]) => {
    Object.entries(localeDict[locale]).forEach(([key, value]) => {
      dict[`${moduleName}.${key}`] = value;
    });
  });

  return dict;
}

export const messagesByLocale: Record<Locale, Record<string, string>> = {
  vi: buildLocaleMessages("vi"),
  en: buildLocaleMessages("en"),
};
