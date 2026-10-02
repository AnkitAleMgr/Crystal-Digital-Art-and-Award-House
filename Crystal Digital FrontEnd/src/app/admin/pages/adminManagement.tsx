import { useState } from "react";
import { useAdmin } from "../components/layout/adminProvider";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import type { AdminRole } from "../types/adminUser";

export function AdminManagement() {
  const { users, addUser, deleteUser, isAdminUser } = useAdmin();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [busy, setBusy] = useState(false);

  if (!isAdminUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admins & Staff</h1>
        <p className="text-gray-600">Only admins can manage admins and staff.</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admins & Staff</h1>
          <p className="text-gray-600">Manage admin and staff accounts</p>
        </div>
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Add</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs uppercase">Role</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => deleteUser(u.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{busy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
