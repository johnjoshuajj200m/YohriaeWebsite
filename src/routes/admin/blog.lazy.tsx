import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatShortDate, slugify } from "@/lib/admin/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/blog")({
  component: AdminBlog,
});

type BlogForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featured_image_url: string;
  published: boolean;
};

const emptyForm = (): BlogForm => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Advocacy",
  author: "YOHRIAE",
  featured_image_url: "",
  published: false,
});

const CATEGORIES = ["Advocacy", "Health", "Youth", "Community", "Reports"];

function AdminBlog() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<BlogForm | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: BlogForm) => {
      const isPublishing = payload.published;
      const row = {
        title: payload.title.trim(),
        slug: payload.slug.trim() || slugify(payload.title),
        excerpt: payload.excerpt.trim() || null,
        content: payload.content,
        category: payload.category.trim() || null,
        author: payload.author.trim() || null,
        featured_image_url: payload.featured_image_url || null,
        published: isPublishing,
        published_at: isPublishing ? new Date().toISOString() : null,
      };

      if (payload.id) {
        const { error } = await supabase.from("blog_posts").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-public"] });
      queryClient.invalidateQueries({ queryKey: ["blog-home"] });
      toast.success(variables.published ? "Blog post published" : "Blog post saved as draft");
      setOpen(false);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message || "Could not save blog post"),
  });

  const publishToggleMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-public"] });
      queryClient.invalidateQueries({ queryKey: ["blog-home"] });
      toast.success(variables.publish ? "Post published" : "Post unpublished");
    },
    onError: (e: Error) => toast.error(e.message || "Could not change publish state"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-public"] });
      queryClient.invalidateQueries({ queryKey: ["blog-home"] });
      toast.success("Blog post deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete post"),
  });

  function openCreate() {
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(post: (typeof posts)[number]) {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      category: (post as { category?: string }).category ?? "",
      author: post.author ?? "",
      featured_image_url: post.featured_image_url ?? "",
      published: post.published,
    });
    setOpen(true);
  }

  if (!permissions.canViewBlog) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view blog posts."
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Blog Management"
        description="Create, edit, publish, and preview stories for the public website."
        action={
          permissions.canManageBlog ? (
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New post
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-semibold">Could not load blog posts</p>
          <p className="mt-1 text-xs opacity-90">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No blog posts yet"
          description="Create your first story to publish on the public blog page."
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {posts.map((post) => (
              <article key={post.id} className="card-ngo overflow-hidden">
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold">{post.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(post as { category?: string }).category ?? "Uncategorized"} ·{" "}
                        {formatShortDate(post.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={post.published ? "published" : "draft"} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      disabled={!permissions.canManageBlog}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    {permissions.canManageBlog && (
                      <button
                        type="button"
                        onClick={() =>
                          publishToggleMutation.mutate({ id: post.id, publish: !post.published })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                      >
                        {post.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Publish
                          </>
                        )}
                      </button>
                    )}
                    {permissions.canDeleteBlog && (
                      <button
                        type="button"
                        onClick={() => setDeleteId(post.id)}
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

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-background md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-semibold">{post.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(post as { category?: string }).category ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.published ? "published" : "draft"} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatShortDate(post.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          className="rounded-md p-2 hover:bg-surface"
                          aria-label="Edit"
                          disabled={!permissions.canManageBlog}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {permissions.canManageBlog && (
                          <button
                            type="button"
                            onClick={() =>
                              publishToggleMutation.mutate({
                                id: post.id,
                                publish: !post.published,
                              })
                            }
                            className="rounded-md p-2 hover:bg-surface"
                            aria-label={post.published ? "Unpublish" : "Publish"}
                            title={post.published ? "Unpublish" : "Publish"}
                          >
                            {post.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setPreview({
                              id: post.id,
                              title: post.title,
                              slug: post.slug,
                              excerpt: post.excerpt ?? "",
                              content: post.content,
                              category: (post as { category?: string }).category ?? "",
                              author: post.author ?? "",
                              featured_image_url: post.featured_image_url ?? "",
                              published: post.published,
                            })
                          }
                          className="rounded-md p-2 hover:bg-surface"
                          aria-label="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {permissions.canDeleteBlog && (
                          <button
                            type="button"
                            onClick={() => setDeleteId(post.id)}
                            className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-[95vw] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit blog post" : "Create blog post"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim() || !form.content.trim()) {
                toast.error("Title and content are required.");
                return;
              }
              saveMutation.mutate(form);
            }}
          >
            <Field
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })}
              required
            />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(v) => setForm({ ...form, slug: slugify(v) })}
              helperText="URL-friendly identifier. Auto-generated from title."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm">
                  <span className="font-semibold">Category</span>
                  <input
                    list="blog-categories"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="form-field mt-1.5"
                    placeholder="Advocacy"
                  />
                </label>
                <datalist id="blog-categories">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <Field
                label="Author"
                value={form.author}
                onChange={(v) => setForm({ ...form, author: v })}
              />
            </div>

            <ImageUpload
              bucket="blog-images"
              value={form.featured_image_url}
              onChange={(url) => setForm({ ...form, featured_image_url: url })}
              label="Featured image"
              helperText="Recommended size 1600×900. PNG, JPG, WebP up to 5 MB."
            />

            <Field
              label="Excerpt"
              value={form.excerpt}
              onChange={(v) => setForm({ ...form, excerpt: v })}
              multiline
              helperText="Short summary shown on blog cards and previews."
            />
            <Field
              label="Content"
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              multiline
              rows={10}
              required
            />

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-[var(--brand-magenta)]"
              />
              Publish on website immediately
            </label>

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
                disabled={saveMutation.isPending}
                className="btn-primary w-full disabled:opacity-60 sm:w-auto"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : form.published
                    ? "Save & publish"
                    : "Save draft"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[92vh] w-[95vw] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <article>
              {preview.featured_image_url && (
                <img
                  src={preview.featured_image_url}
                  alt=""
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-magenta)]">
                {preview.category}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{preview.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">By {preview.author}</p>
              {preview.excerpt && <p className="mt-4 text-muted-foreground">{preview.excerpt}</p>}
              <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap">
                {preview.content}
              </div>
            </article>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete blog post?"
        description="This action cannot be undone. The post will be removed from the website."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  multiline,
  rows = 3,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          className="form-field mt-1.5"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="form-field mt-1.5"
        />
      )}
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </label>
  );
}
