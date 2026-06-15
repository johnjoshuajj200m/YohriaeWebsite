/**
 * Read-only Supabase fetches for JSON-LD schema (SSR-safe, returns [] on failure).
 */

import type { BlogPostSchemaItem, EventSchemaItem } from "@/lib/schema";

export async function fetchPublishedEventsForSchema(): Promise<EventSchemaItem[]> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, starts_at, ends_at, location, description, image_url, organizer, slug, registration_link",
      )
      .eq("published", true)
      .order("starts_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[schema] events fetch failed:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("[schema] events fetch error:", err);
    return [];
  }
}

export async function fetchPublishedBlogPostsForSchema(): Promise<BlogPostSchemaItem[]> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, excerpt, published_at, updated_at, featured_image_url, slug, author",
      )
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[schema] blog fetch failed:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("[schema] blog fetch error:", err);
    return [];
  }
}
