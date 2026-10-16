export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  productSlug?: string;
  size?: string;
  service: string;
  quantity: string;
  /** The date the customer wants the order ready by; "" when they left it blank. */
  neededBy: string;
  // The customer's answers to the product's customizationFields. The label travels
  // with the value so an answer stays readable after the field is renamed or
  // removed; it replaced the `engrave` free-text box.
  customization: { label: string; value: string }[];
  attachment: string;
  // The customer's artwork on Cloudinary. Empty when they attached nothing, or
  // when the upload could not be stored (wrong type, over the size cap, or the
  // daily budget spent) — `attachment` is still the filename in those cases, so
  // the detail modal keeps showing its "ask them to email it" note.
  attachmentUrl: string;
  message: string;
  /** A custom-product request rather than a standard quote. */
  isCustom: boolean;
  status: "new" | "reviewed" | "quoted" | "closed";
  createdAt: string;
  updatedAt: string;
}
