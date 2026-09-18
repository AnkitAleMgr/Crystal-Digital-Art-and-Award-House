import { Routes, Route } from "react-router-dom";
import AdminApp from "../app/admin/AdminApp";
import Layout from "./client/Layout";
import { AboutPage } from "./client/pages/AboutPage";
import { HomePage } from "./client/pages/HomePage";
import { GalleryPage } from "./client/pages/GalleryPage";
import { ContactPage } from "./client/pages/ContactPage";
import { ProductDetailPage } from "./client/pages/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<Layout/>}>
        <Route path="/" element={<HomePage/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/gallery" element={<GalleryPage/>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/products/:productId"
          element={<ProductDetailPage />}
        />
      </Route>

      {/* Admin */}
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}