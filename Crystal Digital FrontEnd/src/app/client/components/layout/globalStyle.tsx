// ── Global CSS ───────────────────────────────────────────────────────────────
export const globalStyles = `
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
  h1,h2,h3,h4,h5,h6 { font-family: 'Poppins', sans-serif; overflow-wrap: break-word; word-break: break-word; }
  p, li, label, blockquote { overflow-wrap: break-word; }
  img { max-width: 100%; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #2563EB; border-radius: 3px; }
  .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in.visible { opacity: 1; transform: none; }
  .slide-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .slide-left.visible { opacity: 1; transform: none; }
  .slide-right { opacity: 0; transform: translateX(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .slide-right.visible { opacity: 1; transform: none; }
  @keyframes testimonialSlide {
    from { opacity: 0; transform: translateX(24px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .testimonial-card { animation: testimonialSlide 0.55s cubic-bezier(0.22,1,0.36,1) both; }

  /* ── Named utility classes — fluid clamp at every viewport width ── */
  .hero-title      { font-size: clamp(1.4rem, 4.5vw + 0.5rem, 3.75rem) !important; }
  .hero-sub        { font-size: clamp(0.82rem, 1.5vw + 0.52rem, 1.25rem) !important; }
  .section-heading { font-size: clamp(1.2rem, 2.5vw + 0.7rem, 2.5rem) !important; }
  .section-label   { font-size: clamp(0.58rem, 0.4vw + 0.46rem, 0.75rem) !important; }
  .card-title      { font-size: clamp(0.78rem, 0.8vw + 0.5rem, 1rem) !important; }
  .card-desc       { font-size: clamp(0.68rem, 0.6vw + 0.44rem, 0.875rem) !important; }
  .stat-number     { font-size: clamp(1.4rem, 2.5vw + 0.8rem, 2.5rem) !important; }
  .tag-pill        { font-size: clamp(0.58rem, 0.4vw + 0.36rem, 0.75rem) !important; }

  /* ── Tablet (≤1024px) — scale headings without named classes ── */
  @media (max-width: 1024px) {
    h1:not(.hero-title) { font-size: clamp(1.5rem, 4.5vw, 2.5rem); }
    h2:not(.section-heading) { font-size: clamp(1.25rem, 3.5vw, 2rem); }
    h3 { font-size: clamp(1.1rem, 3vw, 1.5rem); }
  }

  /* ── Mobile / tablet portrait (≤768px) ── */
  @media (max-width: 768px) {
    h1:not(.hero-title) { font-size: clamp(1.3rem, 5.5vw, 2rem) !important; }
    h2:not(.section-heading) { font-size: clamp(1.1rem, 4.5vw, 1.625rem) !important; }
    h3 { font-size: clamp(1rem, 4vw, 1.3rem) !important; }
    h4 { font-size: clamp(0.9rem, 3.5vw, 1.1rem) !important; }
    .py-16 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
    .section-label { letter-spacing: 0.09em !important; }
  }

  /* ── Small phone (≤480px) ── */
  @media (max-width: 480px) {
    h1:not(.hero-title) { font-size: clamp(1.15rem, 7vw, 1.75rem) !important; }
    h2:not(.section-heading) { font-size: clamp(1rem, 6vw, 1.4rem) !important; }
    h3 { font-size: clamp(0.9rem, 5.5vw, 1.15rem) !important; }
    h4 { font-size: clamp(0.82rem, 4.5vw, 1rem) !important; }
    .tag-pill { padding: 1px 6px !important; }
    .py-16 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
  }

  /* ── Very small phone (≤375px) ── */
  @media (max-width: 375px) {
    h1:not(.hero-title) { font-size: clamp(1.05rem, 8vw, 1.5rem) !important; }
    h2:not(.section-heading) { font-size: clamp(0.95rem, 7vw, 1.25rem) !important; }
    h3 { font-size: clamp(0.85rem, 6vw, 1.05rem) !important; }
    .py-16 { padding-top: 1.75rem !important; padding-bottom: 1.75rem !important; }
  }
`;

export function GlobalStyles() {
  return <style>{globalStyles}</style>;
}
