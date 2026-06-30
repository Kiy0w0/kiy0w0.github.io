import { supabase } from "./supabase";

export type ReactionCount = { emoji: string; count: number };

const KEY = (slug: string) => `kuromi:reacted:${slug}`;

function mine(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(KEY(slug));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persist(slug: string, set: Set<string>): void {
  try {
    localStorage.setItem(KEY(slug), JSON.stringify([...set]));
  } catch {}
}

export function myReactions(slug: string): Set<string> {
  return mine(slug);
}

export async function listReactions(slug: string): Promise<ReactionCount[]> {
  const { data, error } = await supabase
    .from("post_reactions")
    .select("emoji, count")
    .eq("slug", slug)
    .order("count", { ascending: false });
  if (error) return [];
  return (data ?? []).filter((r) => r.count > 0);
}

export async function toggleReaction(
  slug: string,
  emoji: string,
): Promise<{ delta: number; active: boolean } | null> {
  const set = mine(slug);
  const active = set.has(emoji);
  const delta = active ? -1 : 1;
  const { error } = await supabase.rpc("react_to_post", {
    post_slug: slug,
    react_emoji: emoji,
    delta,
  });
  if (error) return null;
  if (active) set.delete(emoji);
  else set.add(emoji);
  persist(slug, set);
  return { delta, active: !active };
}
