const FORM_SUBMIT_AJAX = "https://formsubmit.co/ajax";

export async function notifyOwner(
  subject: string,
  fields: Record<string, string>
): Promise<void> {
  try {
    const res = await fetch(`${FORM_SUBMIT_AJAX}/${encodeURIComponent(fields.To)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _template: "table", ...fields }),
    });

    // FormSubmit answers 200 even when it refuses to send — the failure is only
    // in the body's "success" field. It reports "needs Activation" until the
    // recipient clicks the activation link, and this alert has silently failed
    // for the life of the project because nothing ever read the response.
    const result = await res.json().catch(() => null);

    if (result?.success === false) {
      console.warn(
        `[notifyOwner] owner alert was NOT delivered: ${result.message}`
      );
    }
  } catch (error) {
    // The quote is already saved, so this must never surface to the customer.
    console.warn("[notifyOwner] owner alert request failed:", error);
  }
}
