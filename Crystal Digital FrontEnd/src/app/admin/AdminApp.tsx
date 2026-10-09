import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AdminLogin } from "./components/layout/adminLogin";
import { useAdmin } from "./components/layout/adminProvider";
import { applyPageMeta } from "../client/utils/seo";

// Auth gate for the /admin routes: shows the login screen until authed, a
// spinner while the initial data load is in flight, then the layout.
export default function AdminApp() {
  // Every /admin route — login screen included — must stay out of search
  // results, so the noindex is set here at the gate, not in the layout.
  useEffect(() => {
    applyPageMeta({
      title: "Admin | Crystal Digital",
      description: "Crystal Digital admin dashboard.",
      noindex: true,
    });
  }, []);

  const { authed, onLogin, loading } = useAdmin();

  if (!authed) return <AdminLogin onLogin={onLogin} />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <Loader2 size={28} className="text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard…</p>
      </div>
    );
  }

  return <Outlet />;
}
