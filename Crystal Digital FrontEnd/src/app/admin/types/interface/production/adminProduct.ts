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
  specs: { label: string; value: string }[];
  customizationFields: { label: string; required: boolean; maxLength: number }[];
  tags: string[];
  sizes: string[];
  imgUrl: string;
  imgPublicId?: string;
}