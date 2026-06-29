const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = env.VITE_GUESTBOOK_SUPABASE_URL;
  const key = env.VITE_GUESTBOOK_SUPABASE_ANON_KEY;
  const secret = env.GUESTBOOK_OWNER_SECRET;
  if (!url || !key || !secret) return json({ error: "env missing" }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const id = body?.id;
  if (!id || typeof id !== "string") return json({ error: "id required" }, 400);
  const reply = typeof body?.reply === "string" && body.reply.trim() ? body.reply.trim() : null;

  const r = await fetch(`${url}/rest/v1/rpc/set_owner_reply`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ entry_id: id, reply, secret }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) return json({ error: "rpc failed", data }, r.status);
  return json({ ok: data === true });
}
