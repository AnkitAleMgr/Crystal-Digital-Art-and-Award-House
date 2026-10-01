import { Routes, Route } from "react-router-dom";
import AdminApp from "../app/admin/AdminApp";
import { AdminProvider } from "./admin/components/layout/adminProvider";
import { AdminLayout } from "./admin/components/layout/adminLayout";
import { AdminOverview } from "./admin/pages/DashBoard";
import { AdminProducts } from "./admin/pages/adminProduct";
import { AdminGallery } from "./admin/pages/galleryModal";
import { AdminTestimonials } from "./admin/pages/testimonials";
import { AdminQuotes } from "./admin/pages/quoteRequest";
import { AdminSubscribers } from "./admin/pages/subscriber";
import { AdminSettings } from "./admin/pages/setting";
import Layout from "./client/Layout";
import { SiteDataProvider } from "./client/components/layout/siteDataProvider";
import { AboutPage } from "./client/pages/AboutPage";
import { HomePage } from "./client/pages/HomePage";
import { GalleryPage } from "./client/pages/GalleryPage";
import { ContactPage } from "./client/pages/ContactPage";
import { ProductDetailPage } from "./client/pages/ProductDetailPage";
import { SubscribeConfirmPage } from "./client/pages/subscribeConfirmPage";
import { UnsubscribePage } from "./client/pages/unsubscribePage";

export default function App() {
  return (
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

      {/* Admin */}
      <Route path="/admin" element={<AdminProvider><AdminApp /></AdminProvider>}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}