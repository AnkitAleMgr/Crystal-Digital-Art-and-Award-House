// ── Email Notification Helper ─────────────────────────────────────────────────
export async function sendNotificationEmail(to: string, subject: string, fields: Record<string, string>) {
  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _template: "table", ...fields }),
    });
  } catch {
    // fire-and-forget — silent failure
  }
}