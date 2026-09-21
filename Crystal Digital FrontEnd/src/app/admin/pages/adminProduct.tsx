import { useState } from "react";
import { AdminProduct } from "../types/interface/production/adminProduct";
import { ConfirmModal, ImageUploadField, Input, load, Modal, PRODUCT_CATS, Select, sendNotificationEmail, Textarea } from "../AdminApp";
import { Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";

// ── Products Panel ────────────────────────────────────────────────────────────
function emptyProduct(): Omit<AdminProduct, "id"> {
  return { name: "", desc: "", fullDesc: "", cat: "Crystal", features: [], specs: [], customizable: [], tags: [], sizes: [], imgUrl: "" };
}

function ProductModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AdminProduct;
  onSave: (p: Omit<AdminProduct, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<AdminProduct, "id">>(initial ? { ...initial, sizes: initial.sizes ?? [] } : emptyProduct());
  const [featInput, setFeatInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [specLabel, setSpecLabel] = useState("");
  const [specVal, setSpecVal] = useState("");

  function addItem(field: "features" | "customizable", val: string, setter: (v: string) => void) {
    if (!val.trim()) return;
    setForm((f) => ({ ...f, [field]: [...f[field], val.trim()] }));
    setter("");
  }
  function removeItem(field: "features" | "customizable", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }
  function addTag() {
    if (!tagInput.trim()) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    setTagInput("");
  }
  function addSpec() {
    if (!specLabel.trim() || !specVal.trim()) return;
    setForm((f) => ({ ...f, specs: [...f.specs, { label: specLabel.trim(), value: specVal.trim() }] }));
    setSpecLabel(""); setSpecVal("");
  }

  return (
    <Modal title={initial ? "Edit Product" : "Add New Product"} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Crystal Award" required />
          <Select label="Category *" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            {PRODUCT_CATS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Input label="Short Description *" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Brief product description" required />
        <Textarea label="Full Description" value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} rows={4} placeholder="Detailed product description..." />
        <ImageUploadField label="Product Image" value={form.imgUrl} onChange={(url) => setForm({ ...form, imgUrl: url })} />

        {/* Features */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Features</label>
          <div className="flex gap-2 mb-2">
            <input value={featInput} onChange={(e) => setFeatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("features", featInput, setFeatInput))} placeholder="Add a feature..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={() => addItem("features", featInput, setFeatInput)} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                {f} <button onClick={() => removeItem("features", i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Specs */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Specifications</label>
          <div className="flex gap-2 mb-2">
            <input value={specLabel} onChange={(e) => setSpecLabel(e.target.value)} placeholder="Label (e.g. Material)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <input value={specVal} onChange={(e) => setSpecVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())} placeholder="Value" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={addSpec} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="space-y-1.5">
            {form.specs.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 text-sm">
                <span className="font-medium text-gray-700">{s.label}:</span>
                <span className="text-gray-600">{s.value}</span>
                <button onClick={() => setForm((f) => ({ ...f, specs: f.specs.filter((_, ii) => ii !== i) }))}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Customizable */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Customization Options</label>
          <div className="flex gap-2 mb-2">
            <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("customizable", customInput, setCustomInput))} placeholder="Add option..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={() => addItem("customizable", customInput, setCustomInput)} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.customizable.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
                {c} <button onClick={() => removeItem("customizable", i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Available Sizes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Leave empty if this product comes in one standard size only — size selection will be hidden on the product page.
          </p>
          <div className="flex gap-2 mb-2">
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!sizeInput.trim()) return;
                  setForm((f) => ({ ...f, sizes: [...(f.sizes || []), sizeInput.trim()] }));
                  setSizeInput("");
                }
              }}
              placeholder="e.g. Small — 15cm  or  A4  or  50mm"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              onClick={() => {
                if (!sizeInput.trim()) return;
                setForm((f) => ({ ...f, sizes: [...(f.sizes || []), sizeInput.trim()] }));
                setSizeInput("");
              }}
              className="px-3 py-2 rounded-lg text-white text-sm"
              style={{ background: "#2563EB" }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.sizes || []).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
              >
                {s}{" "}
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, sizes: (f.sizes || []).filter((_, ii) => ii !== i) }))
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {(form.sizes || []).length === 0 && (
              <span className="text-xs text-gray-400 italic">No sizes added — single/standard size product</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="e.g. Popular, Best Seller" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={addTag} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium" style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}>
                <Tag size={11} /> {t} <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((_, ii) => ii !== i) }))}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.desc) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminProducts({ products, setProducts }: { products: AdminProduct[]; setProducts: (p: AdminProduct[]) => void }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [catFilter, setCatFilter] = useState("All");

  const filtered = products.filter((p) =>
    (catFilter === "All" || p.cat === catFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(data: Omit<AdminProduct, "id">) {
    if (editing) {
      const updated = products.map((p) => p.id === editing.id ? { ...data, id: editing.id } : p);
      setProducts(updated);
    } else {
      setProducts([...products, { ...data, id: `prod-${Date.now()}` }]);
      const subscribers: string[] = load("cdaah_subscribers", []);
      subscribers.forEach((email) => {
        sendNotificationEmail(
          email,
          `New Product: ${data.name} — Crystal Digital Art & Award House`,
          {
            Notification: "A new product has been added to Crystal Digital Art & Award House.",
            Product_Name: data.name,
            Category: data.cat,
            Description: data.desc || "—",
            Tags: data.tags?.join(", ") || "—",
            Visit: "https://crystaldigital.com.np",
          }
        );
      });
    }
    setShowModal(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    setProducts(products.filter((p) => p.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="All">All Categories</option>
          {PRODUCT_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tags</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{p.desc}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{p.cat}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleting(p)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
      {deleting && (
        <ConfirmModal message={`Are you sure you want to delete "${deleting.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}

