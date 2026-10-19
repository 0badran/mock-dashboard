import i18n from "@/i18n";

export { cn } from "cn";

export function formatDate(dateString?: string, locale?: string): string {
  if (!dateString) return "-";
  try {
    const parts = dateString.split("-").map(Number);
    const date =
      parts.length === 3 && parts.every((n) => !isNaN(n))
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    const targetLocale = locale || i18n.language || "ar";

    return date.toLocaleDateString(targetLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export * from "./export";
