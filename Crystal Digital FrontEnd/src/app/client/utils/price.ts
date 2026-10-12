// Price is free text the admin types ("Rs. 2,500", "Starting from Rs. 1,200"),
// so an unset price is shown as "N/A" rather than hidden — a missing slot reads
// as a bug, and a quote-only product is still a valid listing.
export const priceLabel = (price?: string | null): string => {
  const text = String(price ?? "").trim();
  return text || "N/A";
};
