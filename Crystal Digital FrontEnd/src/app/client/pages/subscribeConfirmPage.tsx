import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { publicApi } from "../utils/api";

// Reached from the link in the confirmation email, never linked directly from
// anywhere on the site.
//
// The confirming POST is made by this page rather than by the URL, on purpose.
// Mail providers open every link in a message automatically to scan it, so a
// link that confirmed on GET would be confirmed by the scanner — adding
// addresses to the list that no human ever agreed to. Same reasoning as the
// unsubscribe page.
type State = "working" | "done" | "error";

export function SubscribeConfirmPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("working");
  const [message, setMessage] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    // Guards a remount (React can run an effect twice) from confirming twice.
    // Harmless either way — confirming is idempotent — but it is a POST.
    if (sent.current) return;
    sent.current = true;

    const token = params.get("token");

    if (!token) {
      setState("error");
      setMessage("This link is incomplete. Please use the most recent email we sent you.");
      return;
    }

    publicApi
      .confirmSubscription(token)
      .then(() => setState("done"))
      .catch((error) => {
        setState("error");
        setMessage(
          typeof error?.message === "string" && error.message
            ? error.message
            : "This link is invalid or has expired. Please try again."
        );
      });
  }, [params]);

  return (
    <div className="flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center">
        {state === "working" && (
          <>
            <Loader2 size={40} className="mx-auto mb-5 text-blue-600 animate-spin" />
            <h1
              className="text-2xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Confirming your subscription
            </h1>
            <p className="text-gray-500 text-sm">One moment…</p>
          </>
        )}

        {state === "done" && (
          <>
            <CheckCircle size={40} className="mx-auto mb-5 text-green-600" />
            <h1
              className="text-2xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              You're subscribed
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              We'll email you when something new is added to the site. Nothing
              else, and every email has an unsubscribe link.
            </p>
            <Link
              to="/gallery"
              className="inline-block px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
            >
              Browse our work
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle size={40} className="mx-auto mb-5 text-red-500" />
            <h1
              className="text-2xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              We couldn't confirm that
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
            >
              Back to the site
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
