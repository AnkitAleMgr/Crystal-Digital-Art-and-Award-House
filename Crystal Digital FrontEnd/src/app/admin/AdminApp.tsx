import { Outlet } from "react-router-dom";
import { AdminLogin } from "./components/layout/adminLogin";
import { useAdmin } from "./components/layout/adminProvider";

export default function AdminApp() {
  const { authed, onLogin } = useAdmin();
  return authed ? <Outlet /> : <AdminLogin onLogin={onLogin} />;
}