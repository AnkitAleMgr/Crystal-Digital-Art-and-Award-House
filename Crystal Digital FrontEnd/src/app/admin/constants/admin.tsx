import { QuoteRequest } from "../types/interface/quoteRequest/quoteRequest";
import {
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Star,
} from "lucide-react";

export const ADMIN_USER = "admin";
export const ADMIN_PASS = "crystal@2024";
export const PRODUCT_CATS = ["Crystal", "Trophies", "Plaques", "Medals", "Collection", "Gifts"];
export const GALLERY_CATS = ["Crystal Awards", "Trophies", "Plaques", "Medals", "Collection", "Printing"];
export const STATUS_COLORS: Record<QuoteRequest["status"], string> = {
  new: "#2563EB",
  reviewed: "#D4AF37",
  quoted: "#16A34A",
  closed: "#6B7280",
};
export const STATUS_BG: Record<QuoteRequest["status"], string> = {
  new: "#EFF6FF",
  reviewed: "#FEFCE8",
  quoted: "#F0FDF4",
  closed: "#F9FAFB",
};

export type AdminSection = "overview" | "products" | "gallery" | "testimonials" | "quotes" | "settings";

export const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "gallery", label: "Gallery", icon: <Image size={18} /> },
  { id: "testimonials", label: "Testimonials", icon: <Star size={18} /> },
  { id: "quotes", label: "Quote Requests", icon: <MessageSquare size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];