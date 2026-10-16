import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Pills shown before the rest collapse behind "More".
const MAX_VISIBLE = 8;

// Shared category filter pills for the home Featured Collection, the /products
// catalogue and the gallery. One component keeps the three from drifting apart,
// and collapsing a long admin list (25+ categories) keeps it from pushing the
// products down with a wall of pills.
export function CategoryPills({
  filters,
  active,
  onSelect,
  className = "",
}: {
  filters: string[];
  active: string;
  onSelect: (cat: string) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const overflows = filters.length > MAX_VISIBLE;
  const head = filters.slice(0, MAX_VISIBLE);
  // Collapsed, show the first MAX_VISIBLE pills — plus the active one if it sits
  // further down, so a shared ?cat= link never hides the selected category.
  const visible =
    expanded || !overflows
      ? filters
      : head.includes(active)
        ? head
        : [...head, active];

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {visible.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            aria-pressed={isActive}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                : "white",
              color: isActive ? "white" : "#374151",
              border: isActive ? "none" : "1px solid rgba(0,0,0,0.1)",
              boxShadow: isActive
                ? "0 4px 14px rgba(37,99,235,0.3)"
                : "0 1px 4px rgba(0,0,0,0.04)",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {cat}
          </button>
        );
      })}

      {overflows && (
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {expanded ? "Less" : `More (${filters.length - visible.length})`}
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
    </div>
  );
}
