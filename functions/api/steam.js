// Cloudflare Pages Function: proxies the Steam Web API so the secret key stays
// off the client. Handles /api/steam. CF runtime = Workers (not Node), so this
// uses Request/Response and context.env instead of req/res and process.env.
const API = "https://api.steampowered.com";

async function resolveSteamId(input, key) {
  const value = String(input).trim();
  const idMatch = value.match(/(7656\d{13})/);
  if (idMatch) return idMatch[1];
  const vanityMatch = value.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  const vanity = vanityMatch ? vanityMatch[1] : value.replace(/^@/, "");
  const r = await fetch(
    `${API}/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${encodeURIComponent(vanity)}`,
  );
  const j = await r.json();
  return j.response?.success === 1 ? j.response.steamid : null;
}

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

export async function onRequest(context) {
  const { request, env } = context;
  const key = env.STEAM_API_KEY;
  if (!key) return json({ error: "STEAM_API_KEY not set" }, 500);

  const url = new URL(request.url);
  const resolve = url.searchParams.get("resolve");
  const ids = url.searchParams.get("ids");

  try {
    if (resolve) {
      const steamid = await resolveSteamId(resolve, key);
      if (!steamid) return json({ error: "Could not resolve Steam profile" }, 404);
      return json({ steamid });
    }

    if (ids) {
      const list = ids.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100);
      if (!list.length) return json({ players: [] });
      const r = await fetch(
        `${API}/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${list.join(",")}`,
      );
      const j = await r.json();
      const players = (j.response?.players ?? []).map((p) => ({
        steamid: p.steamid,
        name: p.personaname,
        avatar: p.avatarfull,
        url: p.profileurl,
        online: p.personastate !== 0,
      }));
      return json({ players }, 200, {
        "cache-control": "public, s-maxage=600, stale-while-revalidate=1800",
      });
    }

    return json({ error: "Provide ?ids= or ?resolve=" }, 400);
  } catch (e) {
    return json({ error: e.message || "Steam API error" }, 500);
  }
}
