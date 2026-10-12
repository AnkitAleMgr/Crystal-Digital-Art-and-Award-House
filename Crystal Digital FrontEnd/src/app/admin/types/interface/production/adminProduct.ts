export interface AdminProduct {
  id: string;
  // URL segment for the public product page (/products/:slug). The public API
  // only serves products that have one, so a product without a slug is
  // effectively invisible on the site.
  slug: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  // Free text (e.g. "Rs. 2,500"). Empty means the site shows "N/A".
  price: string;
  // When on, the quote form offers the customer a logo/image upload for this
  // product. Off by default — not every product is engraved.
  allowImageUpload: boolean;
  customizationFields: { label: string; required: boolean; maxLength: number }[];
  tags: string[];
  sizes: string[];
  imgUrl: string;
  imgPublicId?: string;
}