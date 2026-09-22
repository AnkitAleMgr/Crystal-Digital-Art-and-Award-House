import { useState } from "react";
import { Testimonial } from "../types/interface/testimonials/testimonials";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ConfirmModal } from "../components/ui/confirmModal";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { Textarea } from "../components/ui/Textarea";
import { useAdmin } from "../components/layout/adminProvider";

function TestimonialModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Testimonial;
  onSave: (t: Omit<Testimonial, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Testimonial, "id">>(
    initial ? { name: initial.name, company: initial.company, text: initial.text, rating: initial.rating }
      : { name: "", company: "", text: "", rating: 5 }
  );

  return (
    <Modal title={initial ? "Edit Testimonial" : "Add Testimonial"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Customer Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Sharma" required />
          <Input label="Company / Organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Pokhara Academy" />
        </div>
        <Textarea label="Review / Testimonial *" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} placeholder="Customer review text..." required />
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setForm({ ...form, rating: r })} className="transition-transform hover:scale-110">
                <Star size={28} fill={r <= form.rating ? "#D4AF37" : "none"} color={r <= form.rating ? "#D4AF37" : "#D1D5DB"} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.text) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Testimonial"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminTestimonials() {
  const { testimonials, setTestimonials } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  function handleSave(data: Omit<Testimonial, "id">) {
    if (editing) {
      setTestimonials(testimonials.map((t) => t.id === editing.id ? { ...data, id: editing.id } : t));
    } else {
      setTestimonials([...testimonials, { ...data, id: `test-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">{testimonials.length} customer reviews</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Star key={r} size={14} fill={r <= t.rating ? "#D4AF37" : "none"} color={r <= t.rating ? "#D4AF37" : "#D1D5DB"} />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(t); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
            <div className="border-t border-gray-50 pt-3">
              <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
              <div className="text-xs text-gray-500">{t.company}</div>
            </div>
          </div>
        ))}
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plus size={20} className="text-blue-500" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Add Review</span>
        </button>
      </div>

      {showModal && (
        <TestimonialModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
      {deleting && (
        <ConfirmModal message={`Delete testimonial from "${deleting.name}"?`} onConfirm={() => { setTestimonials(testimonials.filter((t) => t.id !== deleting.id)); setDeleting(null); }} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}
