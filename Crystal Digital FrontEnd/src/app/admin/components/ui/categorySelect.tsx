import { useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdmin } from "../layout/adminProvider";
import { Select } from "./select";

/**
 * The Category field, shared by the product and gallery modals, with the
 * category list managed inline.
 *
 * The list used to be a hardcoded constant (PRODUCT_CATS / GALLERY_CATS, plus a
 * third copy inside GalleryPage.tsx) and the copies had drifted apart, so a
 * category could be offered in the admin with no filter pill on the site. It now
 * comes from the `categories` collection, which is also what the public site
 * reads — so create, rename and delete here change the site.
 *
 * Deleting does NOT delete the products that used the category: the server
 * clears their `cat` and they become "Uncategorized". The confirmation therefore
 * says how many rows are affected rather than warning about data loss.
 */
export function CategorySelect({
  label = "Category",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (cat: string) => void;
}) {
  const {
    categories,
    createCategory,
    renameCategory,
    deleteCategory,
    products,
    gallery,
    clearError,
  } = useAdmin();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  // A product or gallery item can carry a category name that is not in the list
  // — hand-typed, or left behind by a category renamed outside the admin. Keep
  // it selectable so saving the form doesn't silently drop it.
  const orphaned = value !== "" && !categories.some((c) => c.name === value);
  const selected = categories.find((c) => c.name === value);

  const usedBy = (name: string) => ({
    products: products.filter((p) => p.cat === name).length,
    gallery: gallery.filter((g) => g.cat === name).length,
  });

  // Errors are raised into the page-level banner by the provider, which sits
  // behind this modal — so they are also shown here, next to the field.
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setLocalError("");
    clearError();
    try {
      await task();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name || busy) return;

    await run(async () => {
      const created = await createCategory(name);
      setNewName("");
      onChange(created.name);
    });
  }

  function startRename() {
    if (!selected) return;
    setConfirmId(null);
    setEditingId(selected.id);
    setEditName(selected.name);
  }

  async function handleRename() {
    const name = editName.trim();
    if (!editingId || !name || busy) return;

    await run(async () => {
      // Renaming rewrites the cat of every product and gallery item using it
      // (server-side and in the provider's state), so the field follows along.
      await renameCategory(editingId, name);
      onChange(name);
      setEditingId(null);
    });
  }

  async function handleDelete() {
    if (!confirmId || busy) return;
    const target = categories.find((c) => c.id === confirmId);
    if (!target) return;

    await run(async () => {
      await deleteCategory(confirmId, target.name);
      if (value === target.name) onChange("");
      setConfirmId(null);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Uncategorized —</option>
        {orphaned && <option value={value}>{value} (not in list)</option>}
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </Select>

      {/* Rename / delete act on the selected category. The delete confirmation
          is inline rather than a ConfirmModal: that is a fixed overlay, and
          stacking it inside the product modal's own overlay is asking for
          trouble. */}
      {selected && !editingId && (
        <div className="flex items-center gap-2 text-xs">
          {confirmId === selected.id ? (
            <>
              <span className="text-gray-500 flex-1">
                Remove “{selected.name}”?{" "}
                {(() => {
                  const { products: p, gallery: g } = usedBy(selected.name);
                  if (!p && !g) return "Nothing uses it.";
                  return `${p} product${p === 1 ? "" : "s"}${
                    g ? ` and ${g} gallery item${g === 1 ? "" : "s"}` : ""
                  } will become uncategorized.`;
                })()}
              </span>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="px-2.5 py-1 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="px-2.5 py-1 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-400 flex-1">
                Used on {usedBy(selected.name).products} product
                {usedBy(selected.name).products === 1 ? "" : "s"}
              </span>
              <button
                onClick={startRename}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Pencil size={12} /> Rename
              </button>
              <button
                onClick={() => setConfirmId(selected.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Add */}
      {editingId ? (
        <div className="flex gap-2">
          <input
            value={editName}
            autoFocus
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRename();
              }
              if (e.key === "Escape") setEditingId(null);
            }}
            placeholder="Category name"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={handleRename}
            disabled={busy || !editName.trim()}
            className="px-3 py-2 rounded-lg text-white text-sm disabled:opacity-50"
            style={{ background: "#2563EB" }}
            aria-label="Save category name"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="px-3 py-2 rounded-lg text-gray-600 text-sm bg-gray-100 hover:bg-gray-200"
            aria-label="Cancel rename"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            placeholder="New category…"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={handleAdd}
            disabled={busy || !newName.trim()}
            className="px-3 py-2 rounded-lg text-white text-sm disabled:opacity-50"
            style={{ background: "#2563EB" }}
            aria-label="Add category"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      )}

      {localError && <p className="text-xs text-red-600">{localError}</p>}

      <p className="text-xs text-gray-400">
        Categories are shared with the gallery and appear as the filter tabs on
        the home and gallery pages. Deleting one leaves its products
        uncategorized — it never deletes them.
      </p>
    </div>
  );
}
