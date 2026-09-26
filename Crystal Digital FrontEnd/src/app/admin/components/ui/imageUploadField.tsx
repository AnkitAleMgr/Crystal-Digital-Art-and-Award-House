import { useRef, useState } from "react";
import { AlertCircle, Image, Loader2, X } from "lucide-react";
import { API_BASE, getToken } from "../../utils/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "products",
}: {
  label?: string;
  value: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > MAX_FILE_SIZE) {
      setError("Image is larger than the 5MB limit.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const body = new FormData();
    body.append("image", file);
    body.append("folder", folder);

    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body,
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || "Upload failed");
      }

      onChange(data.data.url, data.data.publicId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Is the backend running?"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div
        className="relative border-2 border-dashed rounded-xl overflow-hidden transition-colors"
        style={{ borderColor: value ? "#2563EB" : "#E5E7EB", background: "#F8FAFC" }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {value ? (
          <div className="relative h-36 flex items-center justify-center">
            <img src={value} alt="Preview" className="h-full w-full object-contain p-2" />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setError(""); onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
              >
                <X size={12} className="text-red-600" />
              </button>
            )}
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-2 text-gray-400">
            {uploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="text-xs font-medium text-blue-600">Uploading…</span>
              </>
            ) : (
              <>
                <Image size={24} />
                <span className="text-xs font-medium">Click to upload image</span>
                <span className="text-xs">JPG, PNG, WebP · Max 5MB</span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </div>
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
