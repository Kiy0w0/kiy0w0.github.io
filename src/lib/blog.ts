import { supabase } from "./supabase";

export type Folder = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  folder_id: string | null;
  published: boolean;
  cover_url: string;
  views: number;
  created_at: string;
  updated_at: string;
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  folder_id: string | null;
  published: boolean;
  cover_url: string;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDateTime(iso: string): string {
  return new Date(iso)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
}

export async function listFolders(): Promise<Folder[]> {
  const { data, error } = await supabase.from("folders").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createFolder(name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, slug: slugify(name) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPosts(opts: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  let q = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (!opts.includeDrafts) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function incrementViews(slug: string): Promise<number | null> {
  const { data, error } = await supabase.rpc("increment_post_views", { post_slug: slug });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await supabase.from("posts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export type Featured = { heading: string; slugs: string[] };

export async function getFeatured(): Promise<Featured> {
  const { data } = await supabase
    .from("home_featured")
    .select("heading,links")
    .eq("id", 1)
    .maybeSingle();
  return {
    heading: data?.heading ?? "Latest blog",
    slugs: Array.isArray(data?.links) ? data.links.slice(0, 3) : [],
  };
}

export async function saveFeatured(f: Featured): Promise<boolean> {
  const { error } = await supabase
    .from("home_featured")
    .upsert({ id: 1, heading: f.heading, links: f.slugs.slice(0, 3) });
  return !error;
}
