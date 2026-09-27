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
