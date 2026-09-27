export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  size?: string;
  service: string;
  quantity: string;
  engrave: string;
  attachment: string;
  message: string;
  status: "new" | "reviewed" | "quoted" | "closed";
  createdAt: string;
  updatedAt: string;
}
