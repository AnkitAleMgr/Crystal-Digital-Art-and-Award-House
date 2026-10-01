import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { publicApi } from "../utils/api";

// Reached from the unsubscribe link at the bottom of every newsletter email, and
// from the List-Unsubscribe header Gmail/Outlook render as their own button.
//
// Like the confirmation page, the POST is made here rather than by the URL, so a
// mail client's automatic link scanning cannot unsubscribe somebody who only
// wanted to read the message.
type State = "working" | "done" | "error";

export function UnsubscribePage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("working");
  const [message, setMessage] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const token = params.get("token");

    if (!token) {
      setState("error");
      setMessage("This link is incomplete. Please use the unsubscribe link in the email itself.");
      return;
    }

    publicApi
      .unsubscribe(token)
      .then(() => setState("done"))
      .catch((error) => {
        setState("error");
        setMessage(
          typeof error?.message === "string" && error.message
            ? error.message
            : "This link is invalid or has expired."
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
              Removing you from our list
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
              You've been unsubscribed
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              You won't get any more product-update emails. Changed your mind? You
              can subscribe again from the footer of any page.
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
            >
              Back to the site
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
              That didn't work
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
