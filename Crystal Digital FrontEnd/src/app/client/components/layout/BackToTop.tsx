import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

// ── BACK TO TOP ───────────────────────────────────────────────────────────────
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return show ? (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      className="fixed bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center z-40 shadow-xl transition-all hover:scale-110"
      style={{
        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
      }}
    >
      <ArrowUp size={18} className="text-white" />
    </button>
  ) : null;
}