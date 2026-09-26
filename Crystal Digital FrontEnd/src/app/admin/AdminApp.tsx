import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AdminLogin } from "./components/layout/adminLogin";
import { useAdmin } from "./components/layout/adminProvider";

export default function AdminApp() {
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
