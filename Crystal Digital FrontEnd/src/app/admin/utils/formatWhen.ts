// Formats an ISO timestamp for the admin tables ("06 Oct 2026, 14:30"), with a
// dash for empty/invalid values. Dates never use the relative "2 hours ago"
// form because the CSV export needs the raw ISO string.
export function formatWhen(iso: string): string {
  const parsed = new Date(iso);
  if (!iso || Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
