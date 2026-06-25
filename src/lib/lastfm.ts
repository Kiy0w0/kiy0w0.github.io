// Last.fm "last played" track via user.getRecentTracks.
// Set LASTFM_USER to your own Last.fm username, otherwise the card is skipped.

const API_KEY = "2a1469cd6f800fb3536cad1a7ab601ef";
export const LASTFM_USER = "OvOliner";

const TIMEOUT_MS = 5_000;

export interface Track {
  name: string;
  artist: string;
  art: string | null;
  url: string;
  nowPlaying: boolean;
}

export async function getLastTrack(): Promise<Track | null> {
  if (!LASTFM_USER) return null;

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(LASTFM_USER)}&api_key=${API_KEY}` +
    `&format=json&limit=1`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`lastfm -> HTTP ${res.status}`);
    const data = await res.json();
    const t = data?.recenttracks?.track?.[0];
    if (!t) return null;

    // Last.fm gives 4 sizes; last = extralarge.
    const images: any[] = t.image ?? [];
    const art = images[images.length - 1]?.["#text"] || null;

    return {
      name: t.name,
      artist: t.artist?.["#text"] ?? t.artist?.name ?? "",
      art,
      url: t.url,
      nowPlaying: t["@attr"]?.nowplaying === "true",
    };
  } finally {
    clearTimeout(timer);
  }
}
