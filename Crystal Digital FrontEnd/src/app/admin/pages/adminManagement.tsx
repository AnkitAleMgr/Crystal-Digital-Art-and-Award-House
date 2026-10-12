import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useAdmin } from "../components/layout/adminProvider";
import { ConfirmModal } from "../components/ui/confirmModal";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import type { AdminRole, AdminUser } from "../types/adminUser";

const ROLE_STYLE: Record<AdminRole, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#2563EB", bg: "#EFF6FF" },
  staff: { label: "Staff", color: "#6B7280", bg: "#F9FAFB" },
};

// Admins & Staff: create and delete accounts. Self-gates here as well as being
// requireAdmin-protected server-side, so a staff member sees an explanation
// instead of a table whose every write would 403.
export function AdminManagement() {
  const { users, refreshUsers, addUser, deleteUser, isAdminUser, error, clearError } = useAdmin();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  // The provider's initial fetch does not include accounts (they are only
  // needed on this page), so pull the list once the admin role is known.
  // refreshUsers is not in the deps: it is recreated on every provider render
  // and watching it would loop on the setUsers it triggers.
  useEffect(() => {
    if (!isAdminUser) return;
    refreshUsers()
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUser]);

  if (!isAdminUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Admins & Staff</h1>
        <p className="text-gray-500 text-sm">Only admins can manage admins and staff.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addUser({ name, email, password, role });
      setOpen(false);
      setName(""); setEmail(""); setPassword(""); setRole("staff");
    } finally {
      setBusy(false);
    }
  };

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteUser(deleting.id);
      setDeleting(null);
    } catch {
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Admins & Staff</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage admin and staff accounts</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "#2563EB" }}
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading accounts...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Users size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">No admin or staff accounts found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Email", "Role", ""].map((heading, i) => (
                    <th key={i} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const style = ROLE_STYLE[u.role] ?? ROLE_STYLE.staff;
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{u.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 break-all">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: style.color, background: style.bg }}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setDeleting(u)}
                          aria-label={`Delete ${u.name}`}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <Modal title="Add Admin/Staff" onClose={() => setOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            <Select label="Role" value={role} onChange={e => setRole(e.target.value as AdminRole)} required>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#2563EB" }}
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmModal
          message={`Remove the "${deleting.name}" account (${deleting.email})? They will no longer be able to sign in.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
