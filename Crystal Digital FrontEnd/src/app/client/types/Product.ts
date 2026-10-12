export interface Product {
  id: string;
  img: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  // Free text (e.g. "Rs. 2,500"). Empty means the site shows "N/A".
  price: string;
  // Whether the quote form offers the logo/image upload for this product.
  allowImageUpload: boolean;
  // The public /products/:slug address. Sent back on the quote so the server
  // re-reads this product's rules instead of trusting the posted labels.
  slug: string;
  // Fields the customer fills in on the quote form. Empty for a product that
  // needs nothing special, which is a valid state and not a placeholder.
  customizationFields: { label: string; required: boolean; maxLength: number }[];
  tags: string[];
  sizes: string[];
}