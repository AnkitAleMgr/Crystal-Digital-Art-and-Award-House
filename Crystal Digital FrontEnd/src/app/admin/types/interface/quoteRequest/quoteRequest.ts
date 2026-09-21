export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  size?: string;
  message: string;
  date: string;
  status: "new" | "reviewed" | "quoted" | "closed";
}