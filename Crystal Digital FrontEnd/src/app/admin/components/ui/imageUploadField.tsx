import { useRef } from "react";
import { Image, X } from "lucide-react";

// ── Image Upload Field ────────────────────────────────────────────────────────
export function ImageUploadField({ label, value, onChange }: { label?: string; value: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div
        className="relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        style={{ borderColor: value ? "#2563EB" : "#E5E7EB", background: "#F8FAFC" }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="relative h-36 flex items-center justify-center">
            <img src={value} alt="Preview" className="h-full w-full object-contain p-2" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              <X size={12} className="text-red-600" />
            </button>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Image size={24} />
            <span className="text-xs font-medium">Click to upload image</span>
            <span className="text-xs">PNG, JPG · Max 5MB</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}