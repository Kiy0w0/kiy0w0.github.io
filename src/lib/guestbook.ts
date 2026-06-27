import { createClient } from "@supabase/supabase-js";
import { censor } from "./censor";

// The guestbook lives in its OWN Supabase project (separate from blog/photos),
// so public writes can't touch anything else. It gets its own client.
const url = import.meta.env.VITE_GUESTBOOK_SUPABASE_URL;
const key = import.meta.env.VITE_GUESTBOOK_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.warn(
    "Guestbook env vars missing: set VITE_GUESTBOOK_SUPABASE_URL and VITE_GUESTBOOK_SUPABASE_ANON_KEY",
  );
}
const gb = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key",
);

export type Entry = {
  id: string;
  name: string;
  message: string;
  likes: number;
  owner_liked: boolean;
  owner_reply: string | null;
  owner_reply_at: string | null;
  created_at: string;
};

export async function listEntries(): Promise<Entry[]> {
  const { data, error } = await gb
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function addEntry(name: string, message: string): Promise<Entry> {
  // Client-side censor for instant UX; the DB trigger censors again server-side.
  const { data, error } = await gb
    .from("guestbook")
    .insert({ name: censor(name), message: censor(message) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function likeEntry(id: string): Promise<number | null> {
  const { data, error } = await gb.rpc("like_entry", { entry_id: id });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

export async function setOwnerLiked(id: string, liked: boolean): Promise<boolean> {
  const { error } = await gb.rpc("set_owner_liked", { entry_id: id, liked });
  return !error;
}

export async function setOwnerReply(id: string, text: string): Promise<boolean> {
  const trimmed = text.trim();
  const payload = trimmed
    ? { owner_reply: censor(trimmed), owner_reply_at: new Date().toISOString() }
    : { owner_reply: null, owner_reply_at: null };
  const { error } = await gb.from("guestbook").update(payload).eq("id", id);
  return !error;
}
