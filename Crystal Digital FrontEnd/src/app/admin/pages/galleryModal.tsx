import { useState } from "react";
import { GalleryItem } from "../types/interface/gallery/gakkeryItem";
import { AdminProduct } from "../types/interface/production/adminProduct";
import { ConfirmModal, GALLERY_CATS, ImageUploadField, Input, Modal, Select } from "../AdminApp";
import { Image, Pencil, Plus, Search, Trash2 } from "lucide-react";

function GalleryModal({
  initial,
  onSave,
  onClose,
  products,
}: {
  initial?: GalleryItem;
  onSave: (g: Omit<GalleryItem, "id">) => void;
  onClose: () => void;
  products: AdminProduct[];
}) {
  const [form, setForm] = useState<Omit<GalleryItem, "id">>(
    initial
      ? { label: initial.label, cat: initial.cat, imgUrl: initial.imgUrl, linkedProductId: initial.linkedProductId }
      : { label: "", cat: "Crystal Awards", imgUrl: "", linkedProductId: undefined }
  );

  return (
    <Modal title={initial ? "Edit Gallery Item" : "Add Gallery Item"} onClose={onClose}>
      <div className="space-y-4">
        <Input label="Title / Label *" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Gold Trophy Display" required />
        <Select label="Category *" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
          {GALLERY_CATS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <ImageUploadField label="Gallery Image" value={form.imgUrl} onChange={(url) => setForm({ ...form, imgUrl: url })} />

        {/* Product link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Link to Product <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 -mt-0.5">
            When linked, a visitor who opens this image in the gallery can click "Open Product Page" to go directly to that product. Leave as <em>None</em> for store, staff, or event photos that are not tied to a specific product.
          </p>
          <select
            value={form.linkedProductId || ""}
            onChange={(e) =>
              setForm({ ...form, linkedProductId: e.target.value || undefined })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">None — store / staff / event image</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.cat})
              </option>
            ))}
          </select>
          {form.linkedProductId && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8" }}
            >
              🔗 Linked to: {products.find((p) => p.id === form.linkedProductId)?.name || form.linkedProductId}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.label) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminGallery({ gallery, setGallery, products }: { gallery: GalleryItem[]; setGallery: (g: GalleryItem[]) => void; products: AdminProduct[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = gallery.filter((g) =>
    (catFilter === "All" || g.cat === catFilter) &&
    g.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(data: Omit<GalleryItem, "id">) {
    if (editing) {
      setGallery(gallery.map((g) => g.id === editing.id ? { ...data, id: editing.id } : g));
    } else {
      setGallery([...gallery, { ...data, id: `gal-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Gallery</h1>
          <p className="text-gray-500 text-sm mt-0.5">{gallery.length} items in gallery</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="All">All Categories</option>
          {GALLERY_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
              {item.imgUrl ? (
                <img src={item.imgUrl} alt={item.label} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image size={32} className="text-blue-200" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-600 hover:text-blue-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(item)} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-600 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold text-gray-800 text-sm mb-2">{item.label}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">{item.cat}</span>
                {item.linkedProductId ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
                    🔗 {products.find((p) => p.id === item.linkedProductId)?.name || "Product"}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    No product link
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Add placeholder */}
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 aspect-video sm:aspect-auto sm:min-h-[160px]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plus size={20} className="text-blue-500" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Add Gallery Item</span>
        </button>
      </div>

      {filtered.length === 0 && gallery.length > 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No items match your filters.</div>
      )}

      {showModal && (
        <GalleryModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} products={products} />
      )}
      {deleting && (
        <ConfirmModal message={`Delete "${deleting.label}" from gallery?`} onConfirm={() => { setGallery(gallery.filter((g) => g.id !== deleting.id)); setDeleting(null); }} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}