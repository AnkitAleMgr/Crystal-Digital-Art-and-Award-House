import { QuoteRequest } from "../types/interface/quoteRequest/quoteRequest";
import {
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Settings,
  Star,
  Users,
} from "lucide-react";

// PRODUCT_CATS and GALLERY_CATS used to live here as hardcoded arrays, and had
// already drifted apart from each other and from a third copy in GalleryPage.
// Categories are now a database collection (`categories`) managed inline in the
// product modal via CategorySelect, and read by the public site through
// GET /api/categories — there is deliberately no list to keep in sync here.
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

export type AdminSection = "overview" | "products" | "gallery" | "testimonials" | "quotes" | "subscribers" | "settings" | "users";

export const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "gallery", label: "Gallery", icon: <Image size={18} /> },
  { id: "testimonials", label: "Testimonials", icon: <Star size={18} /> },
  { id: "quotes", label: "Quote Requests", icon: <MessageSquare size={18} /> },
  { id: "subscribers", label: "Subscribers", icon: <Mail size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  { id: "users", label: "Admins & Staff", icon: <Users size={18} /> },
];