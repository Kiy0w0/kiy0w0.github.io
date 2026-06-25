import { supabase } from "./supabase";

export type Friend = {
  id: string;
  steamid: string;
  note: string;
  created_at: string;
};

export type SteamSummary = {
  steamid: string;
  name: string;
  avatar: string;
  url: string;
  online: boolean;
};

export async function listFriends(): Promise<Friend[]> {
  const { data, error } = await supabase
    .from("steam_friends")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addFriend(input: string, note: string): Promise<Friend> {
  const res = await fetch(`/api/steam?resolve=${encodeURIComponent(input)}`);
  const json = await res.json();
  if (!res.ok || !json.steamid) throw new Error(json.error ?? "Could not resolve profile");

  const { data, error } = await supabase
    .from("steam_friends")
    .insert({ steamid: json.steamid, note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFriend(id: string): Promise<void> {
  const { error } = await supabase.from("steam_friends").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchSummaries(steamids: string[]): Promise<SteamSummary[]> {
  if (!steamids.length) return [];
  const res = await fetch(`/api/steam?ids=${steamids.join(",")}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Steam API error");
  return json.players ?? [];
}
