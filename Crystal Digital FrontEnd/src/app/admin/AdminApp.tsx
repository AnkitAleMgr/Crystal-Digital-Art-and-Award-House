import React, { useState } from "react";
import { AdminDashboard } from "./components/layout/adminDashboard";
import { AdminLogin } from "./components/layout/adminLogin";

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("cdaah_admin") === "1");

  function handleLogin() { setAuthed(true); }
  function handleLogout() {
    sessionStorage.removeItem("cdaah_admin");
    setAuthed(false);
  }

  return authed ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />;
}