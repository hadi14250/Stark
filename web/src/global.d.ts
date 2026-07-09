import type { routing } from "@/i18n/routing";
import type messages from "@/messages/en.json";

// Typed next-intl: locale union + autocompleted/checked message keys.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
