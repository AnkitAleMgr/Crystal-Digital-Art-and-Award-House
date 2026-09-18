import { Routes, Route } from "react-router-dom";



import {
  MainSite,
  AboutPage,
  GalleryPage,
  ContactPage,
  ProductDetailPage,
} from "./client/MainPage";

import AdminApp from "../app/admin/AdminApp";
import Layout from "./client/Layout";

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<Layout/>}>
        <Route path="/" element={<MainSite />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
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