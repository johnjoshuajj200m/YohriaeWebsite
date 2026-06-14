import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatShortDate, slugify } from "@/lib/admin/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

type EventForm = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  starts_at: string;
  event_time: string;
  organizer: string;
  registration_link: string;
  cover_url: string;
  event_status: "upcoming" | "ongoing" | "past";
  published: boolean;
};

const emptyForm = (): EventForm => ({
  title: "",
  slug: "",
  description: "",
  location: "",
  starts_at: new Date().toISOString().slice(0, 10),
  event_time: "09:00",
  organizer: "YOHRIAE",
  registration_link: "",
  cover_url: "",
  event_status: "upcoming",
  published: false,
});

function AdminEvents() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: EventForm) => {
      const startsAt = `${payload.starts_at}T${payload.event_time || "09:00"}:00`;
      const row = {
        title: payload.title,
        slug: payload.slug || slugify(payload.title),
        description: payload.description || null,
        location: payload.location || null,
        starts_at: new Date(startsAt).toISOString(),
        cover_url: payload.cover_url || null,
        organizer: payload.organizer || null,
        registration_link: payload.registration_link || null,
        event_time: payload.event_time || null,
        event_status: payload.event_status,
        published: payload.published,
      };

      if (payload.id) {
        const { error } = await supabase.from("events").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events-public"] });
      toast.success("Event saved");
      setOpen(false);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openEdit(event: (typeof events)[number]) {
    const e = event as typeof event & {
      event_time?: string;
      organizer?: string;
      registration_link?: string;
      event_status?: EventForm["event_status"];
    };
    setForm({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description ?? "",
      location: event.location ?? "",
      starts_at: event.starts_at.slice(0, 10),
      event_time: e.event_time ?? "09:00",
      organizer: e.organizer ?? "",
      registration_link: e.registration_link ?? "",
      cover_url: event.cover_url ?? "",
      event_status: e.event_status ?? "upcoming",
      published: event.published,
    });
    setOpen(true);
  }

  if (!permissions.canViewEvents) {
    return <EmptyState title="Access restricted" description="You do not have permission to view events." />;
  }

  return (
    <>
      <AdminPageHeader
        title="Event Management"
        description="Schedule, publish, and manage YOHRIAE events for the public website."
        action={
          permissions.canManageEvents ? (
            <button type="button" onClick={() => { setForm(emptyForm()); setOpen(true); }} className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> New event
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading events…</p>
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" description="Create your first event to display on the public events page." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const e = event as typeof event & { event_status?: string };
                return (
                  <tr key={event.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-semibold">{event.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatShortDate(event.starts_at)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.event_status ?? "upcoming"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={event.published ? "published" : "draft"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(event)} className="rounded-md p-2 hover:bg-surface" disabled={!permissions.canManageEvents}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        {permissions.canDeleteEvents && (
                          <button type="button" onClick={() => setDeleteId(event.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit event" : "Create event"}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug || slugify(v) })} required />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: slugify(v) })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" type="date" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} required />
              <Field label="Time" type="time" value={form.event_time} onChange={(v) => setForm({ ...form, event_time: v })} />
            </div>
            <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Organizer" value={form.organizer} onChange={(v) => setForm({ ...form, organizer: v })} />
            <Field label="Registration link" value={form.registration_link} onChange={(v) => setForm({ ...form, registration_link: v })} />
            <Field label="Image URL" value={form.cover_url} onChange={(v) => setForm({ ...form, cover_url: v })} />
            <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
            <label className="block text-sm">
              <span className="font-semibold">Event status</span>
              <select
                value={form.event_status}
                onChange={(e) => setForm({ ...form, event_status: e.target.value as EventForm["event_status"] })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish on website
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? "Saving…" : "Save event"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} title="Delete event?" description="This event will be permanently removed." onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </>
  );
}

function Field({ label, value, onChange, required, multiline, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; multiline?: boolean; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={4} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2" />
      )}
    </label>
  );
}
