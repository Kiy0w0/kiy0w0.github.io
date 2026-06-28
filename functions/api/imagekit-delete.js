const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function onRequestPost(context) {
  const { request, env } = context;
  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return json({ error: "ImageKit env missing" }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }
  const fileId = body?.file_id;
  if (!fileId || typeof fileId !== "string") return json({ error: "file_id required" }, 400);

  const auth = "Basic " + btoa(privateKey + ":");
  const r = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: auth },
  });
  if (r.status === 204) return json({ ok: true });
  const out = await r.json().catch(() => ({}));
  return json({ error: out.message || "delete failed", out }, r.status);
}
