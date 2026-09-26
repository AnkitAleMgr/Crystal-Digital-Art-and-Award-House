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
