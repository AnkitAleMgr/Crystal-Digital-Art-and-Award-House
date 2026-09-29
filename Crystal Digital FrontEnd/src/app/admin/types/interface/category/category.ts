/**
 * A product/gallery category, from GET /admin/categories.
 *
 * Products and gallery items store the category *name* in their `cat` field
 * rather than a reference to this document. The category list is the single
 * source of truth for the filter pills on the home and gallery pages, so adding
 * a category here is what makes it appear on the site.
 */
export interface AdminCategory {
  id: string;
  name: string;
  /** Admin-controlled display order; new categories are appended. */
  order: number;
}
