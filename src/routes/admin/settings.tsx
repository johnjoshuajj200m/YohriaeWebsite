import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, EmptyState } from "@/components/admin/AdminUI";
import { useAdminSession } from "@/hooks/useAdminSession";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_SETTINGS, getSiteSettings, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const { data: settings = DEFAULT_SITE_SETTINGS } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
    enabled: permissions.canManageSettings,
  });

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").upsert({
        id: "main",
        name: form.name,
        long_name: form.longName,
        executive_director: form.executiveDirector,
        email: form.email,
        secondary_email: form.secondaryEmail,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        location: form.location,
        footer_text: form.footerText,
        instagram: form.social.instagram,
        twitter: form.social.twitter,
        facebook: form.social.facebook,
        linkedin: form.social.linkedin,
        tiktok: form.social.tiktok,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Website settings updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!permissions.canManageSettings) {
    return <EmptyState title="Access restricted" description="Only administrators can access settings." />;
  }

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Edit public website contact details, footer content, and social media links."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="grid gap-6"
      >
        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-bold">Organization Details</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Organization short name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Field label="Executive Director" value={form.executiveDirector} onChange={(executiveDirector) => setForm({ ...form, executiveDirector })} />
            <Field label="Full organization name" value={form.longName} onChange={(longName) => setForm({ ...form, longName })} className="lg:col-span-2" />
            <Field label="Office location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
            <Field label="Footer/address text" value={form.address} onChange={(address) => setForm({ ...form, address })} />
            <Textarea label="Footer information" value={form.footerText} onChange={(footerText) => setForm({ ...form, footerText })} className="lg:col-span-2" />
          </div>
        </section>

        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-bold">Contact Information</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Primary email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
            <Field label="Secondary email" value={form.secondaryEmail} onChange={(secondaryEmail) => setForm({ ...form, secondaryEmail })} />
            <Field label="Office phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(whatsapp) => setForm({ ...form, whatsapp })} />
          </div>
        </section>

        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-bold">Social Media Links</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Instagram" value={form.social.instagram} onChange={(instagram) => setForm({ ...form, social: { ...form.social, instagram } })} />
            <Field label="Facebook" value={form.social.facebook} onChange={(facebook) => setForm({ ...form, social: { ...form.social, facebook } })} />
            <Field label="X / Twitter" value={form.social.twitter} onChange={(twitter) => setForm({ ...form, social: { ...form.social, twitter } })} />
            <Field label="LinkedIn" value={form.social.linkedin} onChange={(linkedin) => setForm({ ...form, social: { ...form.social, linkedin } })} />
            <Field label="TikTok" value={form.social.tiktok} onChange={(tiktok) => setForm({ ...form, social: { ...form.social, tiktok } })} />
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary disabled:opacity-60">
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
      />
    </label>
  );
}
