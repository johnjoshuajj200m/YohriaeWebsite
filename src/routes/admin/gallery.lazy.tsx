import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/gallery")({
  component: AdminGallery,
});

type GalleryForm = {
  id?: string;
  image_url: string;
  caption: string;
  category: string;
  sort_order: number;
};

const CATEGORIES = ["Health", "Advocacy", "Training", "Youth", "Partnerships", "Community"];

const emptyForm = (): GalleryForm => ({
  image_url: "",
  caption: "",
  category: "Advocacy",
  sort_order: 0,
});

function AdminGallery() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GalleryForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: images = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: GalleryForm) => {
      if (!payload.image_url) {
        throw new Error("Please upload an image before saving.");
      }
      const row = {
        image_url: payload.image_url,
        caption: payload.caption.trim() || null,
        category: payload.category.trim() || null,
        sort_order: Number.isFinite(payload.sort_order) ? payload.sort_order : 0,
      };

      if (payload.id) {
        const { error } = await supabase.from("gallery_images").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_images").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-public"] });
      toast.success("Gallery image saved");
      setOpen(false);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message || "Could not save image"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-public"] });
      toast.success("Image deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(image: (typeof images)[number]) {
    setForm({
      id: image.id,
      image_url: image.image_url,
      caption: image.caption ?? "",
      category: image.category ?? "",
      sort_order: image.sort_order ?? 0,
    });
    setOpen(true);
  }

  if (!permissions.canViewBlog) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to manage the gallery."
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Upload, caption, and organize photos shown on the public gallery page."
        action={
          permissions.canManageBlog ? (
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add photo
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-semibold">Could not load gallery</p>
          <p className="mt-1 text-xs opacity-90">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading gallery…</p>
      ) : images.length === 0 ? (
        <EmptyState
          title="No photos yet"
          description="Upload your first photo so it appears on the public gallery page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="card-ngo overflow-hidden">
              <img
                src={image.image_url}
                alt={image.caption ?? ""}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-4">
                {image.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-magenta)]">
                    {image.category}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-sm text-foreground">
                  {image.caption || "Untitled photo"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Order: {image.sort_order ?? 0}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(image)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {permissions.canDeleteBlog && (
                    <button
                      type="button"
                      onClick={() => setDeleteId(image.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit photo" : "Add photo"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <ImageUpload
              bucket="gallery-images"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              label="Photo"
              helperText="Square or landscape works best. PNG, JPG, WebP up to 5 MB."
              aspectClass="aspect-square"
            />

            <label className="block text-sm">
              <span className="font-semibold">Caption / title</span>
              <input
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                className="form-field mt-1.5"
                placeholder="e.g. Community workshop in Kano"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold">Category</span>
                <input
                  list="gallery-categories"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="form-field mt-1.5"
                />
                <datalist id="gallery-categories">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
                  className="form-field mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first.</p>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-outline w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending || !form.image_url}
                className="btn-primary w-full disabled:opacity-60 sm:w-auto"
              >
                {saveMutation.isPending ? "Saving…" : "Save photo"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete photo?"
        description="This image will be removed from the public gallery."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
