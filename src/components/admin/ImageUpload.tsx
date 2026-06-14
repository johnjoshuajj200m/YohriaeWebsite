import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export type StorageBucket = "blog-images" | "event-images" | "gallery-images";

export function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Image",
  helperText = "PNG, JPG, WebP or GIF · up to 5 MB",
  aspectClass = "aspect-video",
}: {
  bucket: StorageBucket;
  value: string;
  onChange: (publicUrl: string) => void;
  label?: string;
  helperText?: string;
  aspectClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Unsupported file type. Use PNG, JPG, WebP or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is larger than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
      const safeName =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`) + (ext ? `.${ext}` : "");

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(safeName, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(safeName);
      if (!data?.publicUrl) throw new Error("Could not resolve public URL");

      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onPick() {
    inputRef.current?.click();
  }

  function clearImage() {
    onChange("");
  }

  return (
    <div>
      <span className="block text-sm font-semibold">{label}</span>
      <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>

      <div
        className={`mt-2 flex flex-col gap-3 rounded-md border border-dashed border-border bg-surface p-3 sm:flex-row sm:items-stretch`}
      >
        <div
          className={`relative ${aspectClass} w-full overflow-hidden rounded-md bg-background sm:w-40`}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPick}
              disabled={uploading}
              className="btn-outline px-3 py-2 text-xs disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" /> {value ? "Replace image" : "Upload image"}
                </>
              )}
            </button>
            {value && !uploading && (
              <button
                type="button"
                onClick={clearImage}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          {value && (
            <p className="break-all text-[11px] leading-snug text-muted-foreground">{value}</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
