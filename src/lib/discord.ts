export const USER_ID = "586802340607164417";

const DCDN_URL = `https://dcdn.dstn.to/profile/${USER_ID}`;
const LANYARD_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;

const TIMEOUT_MS = 5_000;
const CACHE_KEY = "discord.profile.v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

export type Status = "online" | "idle" | "dnd" | "offline";

export interface Activity {
  name: string;
  details?: string;
  state?: string;
  type: number;
  largeImage: string | null;
  smallImage: string | null;
  start: number | null;
}

export interface Badge {
  id: string;
  description: string;
  icon: string;
}

export interface Spotify {
  song: string;
  artist: string;
  album: string;
  albumArt: string | null;
  trackUrl: string | null;
  start: number | null;
  end: number | null;
}

export interface Listening {
  name: string;
  title: string;
  artist: string | null;
  albumArt: string | null;
  start: number | null;
  end: number | null;
}

export interface Profile {
  id: string;
  username: string;
  globalName: string | null;
  discriminator: string;
  avatarUrl: string;
  avatarDecorationUrl: string | null;
  bannerUrl: string | null;
  accentColor: number | null;
  bio: string | null;
  status: Status;
  customStatus: string | null;
  nameColor: string | null;
  badges: Badge[];
  onDesktop: boolean;
  onMobile: boolean;
  onWeb: boolean;
  spotify: Spotify | null;
  listening: Listening | null;
  activities: Activity[];
}

interface CacheRow {
  storedAt: number;
  value: Profile;
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function avatarUrl(id: string, hash: string | null | undefined): string {
  if (!hash) {
    const idx = (BigInt(id) >> 22n) % 6n;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${hash}.${ext}?size=256`;
}

function bannerUrl(id: string, hash: string | null | undefined): string | null {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${id}/${hash}.${ext}?size=600`;
}

function decorationUrl(asset: string | null | undefined): string | null {
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&passthrough=true`;
}

function readCache(): Profile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const row = JSON.parse(raw) as CacheRow;
    if (Date.now() - row.storedAt > CACHE_TTL_MS) return null;
    return row.value;
  } catch {
    return null;
  }
}

function writeCache(value: Profile): void {
  try {
    const row: CacheRow = { storedAt: Date.now(), value };
    localStorage.setItem(CACHE_KEY, JSON.stringify(row));
  } catch {
    return;
  }
}

function assetUrl(appId: string | undefined, asset: string | undefined): string | null {
  if (!asset) return null;
  if (asset.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${asset.replace("mp:external/", "")}`;
  }
  if (asset.startsWith("mp:")) {
    return `https://media.discordapp.net/${asset.slice(3)}`;
  }
  if (appId) {
    return `https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`;
  }
  return null;
}

function nameColorHex(dcdn: any): string | null {
  const c = dcdn?.display_name_styles?.colors?.[0];
  if (typeof c !== "number") return null;
  return `#${c.toString(16).padStart(6, "0")}`;
}

function normalize(dcdn: any, lanyard: any): Profile {
  const user = dcdn?.user ?? {};
  const du = lanyard?.data?.discord_user ?? {};
  const id = user.id ?? du.id ?? USER_ID;

  const acts: any[] = lanyard?.data?.activities ?? [];
  const custom = acts.find((a) => a.type === 4);
  const sp = lanyard?.data?.spotify;
  const listen = acts.find((a) => a.type === 2 && a.name !== "Spotify");

  const d = lanyard?.data ?? {};

  return {
    id,
    username: user.username ?? du.username ?? "unknown",
    globalName: user.global_name ?? du.global_name ?? null,
    discriminator: user.discriminator ?? du.discriminator ?? "0",
    avatarUrl: avatarUrl(id, user.avatar ?? du.avatar),
    avatarDecorationUrl: decorationUrl(
      user.avatar_decoration_data?.asset ?? du.avatar_decoration_data?.asset
    ),
    bannerUrl: bannerUrl(id, user.banner),
    accentColor: user.accent_color ?? null,
    bio: user.bio?.trim() || null,
    status: (d.discord_status as Status) ?? "offline",
    customStatus: custom?.state?.trim() || null,
    nameColor: nameColorHex(dcdn),
    badges: Array.isArray(dcdn?.badges)
      ? dcdn.badges.map((b: any) => ({
          id: b.id,
          description: b.description,
          icon: b.icon,
        }))
      : [],
    onDesktop: !!d.active_on_discord_desktop,
    onMobile: !!d.active_on_discord_mobile,
    onWeb: !!d.active_on_discord_web,
    spotify: sp
      ? {
          song: sp.song,
          artist: sp.artist,
          album: sp.album,
          albumArt: sp.album_art_url ?? null,
          trackUrl: sp.track_id
            ? `https://open.spotify.com/track/${sp.track_id}`
            : null,
          start: sp.timestamps?.start ?? null,
          end: sp.timestamps?.end ?? null,
        }
      : null,
    listening: listen
      ? {
          name: listen.name,
          title: listen.details ?? listen.assets?.large_text ?? listen.name,
          artist: listen.state ?? null,
          albumArt: assetUrl(listen.application_id, listen.assets?.large_image),
          start: listen.timestamps?.start ?? null,
          end: listen.timestamps?.end ?? null,
        }
      : null,
    activities: acts
      .filter((a) => a.type !== 4 && a.type !== 2 && a.name !== "Spotify")
      .map((a) => ({
        name: a.name,
        details: a.details,
        state: a.state,
        type: a.type,
        largeImage: assetUrl(a.application_id, a.assets?.large_image),
        smallImage: assetUrl(a.application_id, a.assets?.small_image),
        start: a.timestamps?.start ?? null,
      })),
  };
}

export async function getProfile(_force = false): Promise<Profile> {
  const [dcdnRes, lanyardRes] = await Promise.allSettled([
    fetchJson(DCDN_URL),
    fetchJson(LANYARD_URL),
  ]);

  const dcdn = dcdnRes.status === "fulfilled" ? dcdnRes.value : null;
  const lanyard = lanyardRes.status === "fulfilled" ? lanyardRes.value : null;

  if (!dcdn && !lanyard) {
    const cached = readCache();
    if (cached) return cached;
    throw new Error("Both Discord APIs are unreachable");
  }

  const profile = normalize(dcdn, lanyard);
  writeCache(profile);
  return profile;
}

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  online: { label: "Online", color: "#3fb950" },
  idle: { label: "Idle", color: "#d29922" },
  dnd: { label: "Do Not Disturb", color: "#f85149" },
  offline: { label: "Offline", color: "#6e7681" },
};
