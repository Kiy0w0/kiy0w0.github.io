// Vercel serverless function. Proxies the Steam Web API so the secret key never
// reaches the browser, and CDN-caches responses so Steam isn't hammered.
const KEY = process.env.STEAM_API_KEY;
const API = "https://api.steampowered.com";

async function resolveSteamId(input) {
  const value = String(input).trim();
  // /profiles/<id64> or a bare 17-digit SteamID64.
  const idMatch = value.match(/(7656\d{13})/);
  if (idMatch) return idMatch[1];
  // Vanity: steamcommunity.com/id/<name>, or a bare custom name.
  const vanityMatch = value.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  const vanity = vanityMatch ? vanityMatch[1] : value.replace(/^@/, "");
  const r = await fetch(
    `${API}/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(vanity)}`,
  );
  const j = await r.json();
  return j.response?.success === 1 ? j.response.steamid : null;
}

export default async function handler(req, res) {
  if (!KEY) {
    res.status(500).json({ error: "STEAM_API_KEY not set" });
    return;
  }
  try {
    const { ids, resolve } = req.query;

    if (resolve) {
      const steamid = await resolveSteamId(resolve);
      if (!steamid) {
        res.status(404).json({ error: "Could not resolve Steam profile" });
        return;
      }
      res.status(200).json({ steamid });
      return;
    }

    if (ids) {
      const list = String(ids)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 100);
      if (!list.length) {
        res.status(200).json({ players: [] });
        return;
      }
      const r = await fetch(
        `${API}/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${list.join(",")}`,
      );
      const j = await r.json();
      const players = (j.response?.players ?? []).map((p) => ({
        steamid: p.steamid,
        name: p.personaname,
        avatar: p.avatarfull,
        url: p.profileurl,
        online: p.personastate !== 0, // 0 = offline; anything else = online/away/busy
      }));
      // CDN cache: ~10 min fresh, serve stale up to 30 min while revalidating.
      res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
      res.status(200).json({ players });
      return;
    }

    res.status(400).json({ error: "Provide ?ids= or ?resolve=" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Steam API error" });
  }
}
