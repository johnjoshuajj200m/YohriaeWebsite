import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatShortDate, slugify } from "@/lib/admin/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/blog")({
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
  cover_url: string;
  published: boolean;
};

const emptyForm = (): BlogForm => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Advocacy",
  author: "YOHRIAE",
  cover_url: "",
  published: false,
});

function AdminBlog() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<BlogForm | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
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
      const row = {
        title: payload.title,
        slug: payload.slug || slugify(payload.title),
        excerpt: payload.excerpt || null,
        content: payload.content,
        category: payload.category || null,
        author: payload.author || null,
        cover_url: payload.cover_url || null,
        published: payload.published,
        published_at: payload.published ? new Date().toISOString() : null,
      };

      if (payload.id) {
        const { error } = await supabase.from("blog_posts").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-public"] });
      toast.success("Blog post saved");
      setOpen(false);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Blog post deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
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
      cover_url: post.cover_url ?? "",
      published: post.published,
    });
    setOpen(true);
  }

  if (!permissions.canViewBlog) {
    return <EmptyState title="Access restricted" description="You do not have permission to view blog posts." />;
  }

  return (
    <>
      <AdminPageHeader
        title="Blog Management"
        description="Create, edit, publish, and preview stories for the public website."
        action={
          permissions.canManageBlog ? (
            <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> New post
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : posts.length === 0 ? (
        <EmptyState title="No blog posts yet" description="Create your first story to publish on the public blog page." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
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
                  <td className="px-4 py-3 text-muted-foreground">{(post as { category?: string }).category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.published ? "published" : "draft"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatShortDate(post.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(post)} className="rounded-md p-2 hover:bg-surface" aria-label="Edit" disabled={!permissions.canManageBlog}>
                        <Pencil className="h-4 w-4" />
                      </button>
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
                            cover_url: post.cover_url ?? "",
                            published: post.published,
                          })
                        }
                        className="rounded-md p-2 hover:bg-surface"
                        aria-label="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions.canDeleteBlog && (
                        <button type="button" onClick={() => setDeleteId(post.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label="Delete">
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit blog post" : "Create blog post"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })} required />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: slugify(v) })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
            </div>
            <Field label="Featured image URL" value={form.cover_url} onChange={(v) => setForm({ ...form, cover_url: v })} />
            <Field label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} multiline />
            <Field label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} multiline rows={8} required />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish on website
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? "Saving…" : form.published ? "Save & publish" : "Save draft"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
          {preview && (
            <article>
              {preview.cover_url && <img src={preview.cover_url} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />}
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{preview.category}</p>
              <h2 className="mt-2 text-2xl font-bold">{preview.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">By {preview.author}</p>
              {preview.excerpt && <p className="mt-4 text-muted-foreground">{preview.excerpt}</p>}
              <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap">{preview.content}</div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
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
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
        />
      )}
    </label>
  );
}
