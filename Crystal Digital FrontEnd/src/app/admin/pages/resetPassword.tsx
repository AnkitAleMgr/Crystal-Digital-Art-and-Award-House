import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, Lock } from "lucide-react";
import { API_BASE } from "../utils/api";
import { applyPageMeta } from "../../client/utils/seo";

// Reached from the link in the "Forgot password" email, never linked from the
// dashboard. It is a public route on purpose: there is no session yet, so the
// token in the URL is the only credential.
//
// The token is NOT spent when the page loads — it is only POSTed when a human
// submits a new password. Mail providers open every link in a message to scan it,
// and a page that reset on mount would let that scanner set a password nobody
// asked for. Same reasoning as the newsletter confirm/unsubscribe pages.
export function AdminResetPassword() {
  useEffect(() => {
    applyPageMeta({
      title: "Reset Password | Crystal Digital",
      description: "Choose a new password for your admin account.",
      noindex: true,
    });
  }, []);

  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = params.get("token") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.status) {
        setDone(true);
      } else {
        setError(
          data?.errors?.password ||
            data?.message ||
            "This reset link is invalid or has expired. Please request a new one."
        );
      }
    } catch {
      setError("Unable to reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)" }}
    >
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl" style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)" }}>
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Admin Portal</h1>
          <p className="text-blue-200 text-sm">Crystal Digital Art & Award House</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle size={40} className="mx-auto mb-4 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Password updated</h2>
              <p className="text-gray-500 text-sm mb-6">You can now sign in with your new password.</p>
              <Link
                to="/admin"
                className="inline-block px-5 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
              >
                Go to sign in
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Link not valid</h2>
              <p className="text-gray-500 text-sm mb-6">This reset link is incomplete. Please use the most recent email we sent you.</p>
              <Link to="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Choose a new password</h2>
              <p className="text-gray-500 text-sm mb-6">At least 8 characters. This link works only once.</p>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-5">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">New password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      minLength={8}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirm password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-70 mt-2"
                  style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>

              <Link to="/admin" className="mt-4 block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
