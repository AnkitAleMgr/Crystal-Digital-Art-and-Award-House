import { lazy, Suspense, type ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { Routes, Route } from "react-router-dom";
import AdminApp from "../app/admin/AdminApp";
import { AdminProvider } from "./admin/components/layout/adminProvider";
import { AdminLayout } from "./admin/components/layout/adminLayout";
import Layout from "./client/Layout";
import { SiteDataProvider } from "./client/components/layout/siteDataProvider";

// Route-level code splitting: each page is fetched on demand so the initial
// bundle carries only the shell. React.lazy needs a default export, so the
// helper picks the named export out of the dynamically imported module.
function lazyPage(name: string, loader: () => Promise<Record<string, unknown>>) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[name] as ComponentType<Record<string, never>> };
  });
}

const HomePage = lazyPage("HomePage", () => import("./client/pages/HomePage"));
const AboutPage = lazyPage("AboutPage", () => import("./client/pages/AboutPage"));
const GalleryPage = lazyPage("GalleryPage", () => import("./client/pages/GalleryPage"));
const ContactPage = lazyPage("ContactPage", () => import("./client/pages/ContactPage"));
const ProductDetailPage = lazyPage("ProductDetailPage", () => import("./client/pages/ProductDetailPage"));
const SubscribeConfirmPage = lazyPage("SubscribeConfirmPage", () => import("./client/pages/subscribeConfirmPage"));
const UnsubscribePage = lazyPage("UnsubscribePage", () => import("./client/pages/unsubscribePage"));

const AdminOverview = lazyPage("AdminOverview", () => import("./admin/pages/DashBoard"));
const AdminProducts = lazyPage("AdminProducts", () => import("./admin/pages/adminProduct"));
const AdminGallery = lazyPage("AdminGallery", () => import("./admin/pages/galleryModal"));
const AdminTestimonials = lazyPage("AdminTestimonials", () => import("./admin/pages/testimonials"));
const AdminQuotes = lazyPage("AdminQuotes", () => import("./admin/pages/quoteRequest"));
const AdminSubscribers = lazyPage("AdminSubscribers", () => import("./admin/pages/subscriber"));
const AdminManagement = lazyPage("AdminManagement", () => import("./admin/pages/adminManagement"));
const AdminSettings = lazyPage("AdminSettings", () => import("./admin/pages/setting"));
const AdminResetPassword = lazyPage("AdminResetPassword", () => import("./admin/pages/resetPassword"));

// Shown while a lazily loaded page chunk is in flight.
function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 size={28} className="text-blue-600 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public website — SiteDataProvider sits above the Layout so all public
            pages share one fetch instead of refetching on every navigation. */}
        <Route element={<SiteDataProvider><Layout/></SiteDataProvider>}>
          <Route path="/" element={<HomePage/>} />
          <Route path="/about" element={<AboutPage/>} />
          <Route path="/gallery" element={<GalleryPage/>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/products/:productId"
            element={<ProductDetailPage />}
          />
          {/* Reached from the links in newsletter emails. Deliberately public
              pages inside the site Layout — the token in the URL is the only
              credential, and a bare JSON response would look broken. */}
          <Route
            path="/subscribe/confirm"
            element={<SubscribeConfirmPage />}
          />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
        </Route>

        {/* Admin password reset — reached from the email link, so it must be
            reachable with no session. Rendered outside AdminProvider/AdminApp on
            purpose: the login gate would otherwise swallow it. Placed before the
            /admin branch so the static path always wins the match. */}
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        {/* Admin — AdminProvider owns auth and all dashboard data; AdminApp gates
            on login, AdminLayout supplies the shell. Auth guard note: every admin
            route here needs a matching NAV_ITEMS entry AND this route map. */}
        <Route path="/admin" element={<AdminProvider><AdminApp /></AdminProvider>}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="users" element={<AdminManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
