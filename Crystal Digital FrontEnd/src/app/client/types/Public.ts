export interface PublicGalleryItem {
  id: string;
  label: string;
  cat: string;
  img: string;
  linkedProductId?: string;
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
