import type { ReactNode } from "react";

// Shared section scaffolding for every public page: consistent vertical
// padding, max-width container and optional background colour.
export function Section({
  children,
  className = "",
  bg = "white",
  id,
}: {
  children: ReactNode;
  className?: string;
  bg?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`py-16 lg:py-24 ${className}`}
      style={{ background: bg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

// Gold dash-rule label above a section heading ("What We Do", etc).
export function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="w-8 h-0.5 rounded"
        style={{ background: "#D4AF37" }}
      />
      <span
        className="section-label text-xs font-bold tracking-widest uppercase"
        style={{
          color: "#8C6D0E",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {children}
      </span>
      <span
        className="w-8 h-0.5 rounded"
        style={{ background: "#D4AF37" }}
      />
    </div>
  );
}

// Section title; `light` sets white text for use on blue/dark sections.
export function SectionHeading({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className="section-heading text-3xl lg:text-4xl font-bold leading-tight"
      style={{
        color: light ? "#fff" : "#1F2937",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {children}
    </h2>
  );
}