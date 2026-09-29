import type { PublicCategory } from "../types/Public";

/**
 * Shared filter-pill logic for the category lists on the home and gallery
 * pages. Both pages used to carry their own hardcoded array of category names,
 * and the two lists had already drifted apart — a category could be offered in
 * the admin but have no pill, and a "Gifts" product could not be filtered at
 * all. The pills are now derived from GET /api/categories, so adding a category
 * in the admin is all it takes for it to appear on the site.
 */

export const ALL_FILTER = "All";

/**
 * Deleting a category in the admin clears the `cat` of every product and gallery
 * item that used it rather than deleting them, so "no category" is a normal
 * state those items can end up in. Without a pill for it, everything
 * uncategorized would be reachable only through "All".
 */
export const UNCATEGORIZED_FILTER = "Uncategorized";

/**
 * The pills to render, in order: All, every category in the admin's order, then
 * Uncategorized — but only when something is actually uncategorized, so the tab
 * doesn't show up on an empty site.
 *
 * A category with no items still gets a pill: the admin arranged that list on
 * purpose, and the page already has an empty state for it.
 */
export function categoryFilters(
  categories: PublicCategory[],
  uncategorisedCount: number
): string[] {
  const filters = [ALL_FILTER, ...categories.map((c) => c.name)];
  return uncategorisedCount > 0 ? [...filters, UNCATEGORIZED_FILTER] : filters;
}

/** Whether an item's `cat` belongs under the given pill. */
export function inCategory(cat: string, filter: string): boolean {
  if (filter === ALL_FILTER) return true;
  if (filter === UNCATEGORIZED_FILTER) return !cat;
  return cat === filter;
}

/** What to show wherever a category is displayed — never an empty tag. */
export const catLabel = (cat: string) => cat || UNCATEGORIZED_FILTER;
