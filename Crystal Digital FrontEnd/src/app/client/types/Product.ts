export interface Product {
  id: string;
  img: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  specs: { label: string; value: string }[];
  // The public /products/:slug address. Sent back on the quote so the server
  // re-reads this product's rules instead of trusting the posted labels.
  slug: string;
  // Fields the customer fills in on the quote form. Empty for a product that
  // needs nothing special, which is a valid state and not a placeholder.
  customizationFields: { label: string; required: boolean; maxLength: number }[];
  tags: string[];
  sizes: string[];
}