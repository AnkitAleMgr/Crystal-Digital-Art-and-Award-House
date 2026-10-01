export interface PublicGalleryItem {
  id: string;
  label: string;
  /** A category *name*, or "" when the item is uncategorized. */
  cat: string;
  img: string;
  linkedProductId?: string;
}

/**
 * One entry of the shared product/gallery category list, from
 * GET /api/categories. Products and gallery items store the category name, so
 * this list is what the filter pills on the home and gallery pages are built
 * from — the admin adds and removes them at runtime.
 */
export interface PublicCategory {
  id: string;
  name: string;
  /** Admin-controlled display order. */
  order: number;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  company: string;
  text: string;
  rating: number;
}

/** The business details rendered across the public site, from GET /api/settings. */
export interface PublicSettings {
  id?: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  mapLink: string;
  facebookUrl: string;
  workingHours: string;
  whatsapp: string;
}

export interface QuoteSubmission {
  name: string;
  email: string;
  phone?: string;
  product?: string;
  size?: string;
  service?: string;
  quantity?: string;
  engrave?: string;
  attachment?: string;
  message?: string;
  website?: string;
}

/** The footer newsletter box. `website` is a honeypot — see QuoteSubmission. */
export interface SubscriberSubmission {
  email: string;
  website?: string;
}

/**
 * What POST /api/subscribers answers with. The row is stored as `pending` either
 * way; `alreadySubscribed` is the one thing worth telling the visitor, so an
 * address that is already confirmed is not told to go and check an inbox that
 * will stay empty.
 */
export interface SubscriberAck {
  id: string | null;
  alreadySubscribed: boolean;
}

/** What the confirm / unsubscribe pages get back. */
export interface SubscriberResult {
  email: string;
}
