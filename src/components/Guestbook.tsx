import { useEffect, useState } from "react";
import { addEntry, likeEntry, listEntries, setOwnerLiked, setOwnerReply, type Entry } from "../lib/guestbook";
import { formatDateTime } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { getProfile, type Profile } from "../lib/discord";

const LIKED_KEY = "gb-liked";
const getLiked = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
};

export function Guestbook() {
  const { isOwner } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [liked, setLiked] = useState<Set<string>>(getLiked);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    let alive = true;
    listEntries()
      .then((e) => alive && setEntries(e))
      .catch((e) => alive && setError(e.message ?? "Failed to load"))
      .finally(() => alive && setLoading(false));
    getProfile().then((p) => alive && setOwner(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const entry = await addEntry(name.trim(), message.trim());
      setEntries((prev) => [entry, ...prev]);
      setName("");
      setMessage("");
    } catch (err) {
      setError((err as Error).message ?? "Failed to sign");
    } finally {
      setBusy(false);
    }
  }

  async function onLike(id: string) {
    if (liked.has(id)) return;
    const next = new Set(liked).add(id);
    setLiked(next);
    localStorage.setItem(LIKED_KEY, JSON.stringify([...next]));
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, likes: e.likes + 1 } : e)));
    const total = await likeEntry(id);
    if (total != null)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, likes: total } : e)));
  }

  async function onOwnerLike(id: string, current: boolean) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, owner_liked: !current } : e)));
    const ok = await setOwnerLiked(id, !current);
    if (!ok)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, owner_liked: current } : e)));
  }

  function startReply(en: Entry) {
    setReplyTo(en.id);
    setReplyText(en.owner_reply ?? "");
  }

  async function saveReply(id: string) {
    const text = replyText.trim();
    setReplyTo(null);
    const at = text ? new Date().toISOString() : null;
    const prev = entries;
    setEntries((p) =>
      p.map((e) => (e.id === id ? { ...e, owner_reply: text || null, owner_reply_at: at } : e)),
    );
    const ok = await setOwnerReply(id, text);
    if (!ok) setEntries(prev);
  }

  return (
    <section className="guestbook" id="guestbook">
      <div className="gb-header">
        <span className="gb-label mono">guestbook</span>
        <span className="gb-rule" />
      </div>

      <div className="gb-cols">
        <div className="gb-left">
          <p className="gb-lead">Leave a message. Say anything.</p>
          <form className="gb-form" onSubmit={onSubmit}>
            <input
              className="gb-input mono"
              placeholder="your name"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="gb-input gb-textarea mono"
              placeholder="say something..."
              maxLength={280}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="field-error mono">{error}</p>}
            <button type="submit" className="gb-send" disabled={busy || !name.trim() || !message.trim()}>
              {busy ? "sending…" : "send →"}
            </button>
          </form>
        </div>

        <div className="gb-right">
          {loading && <p className="blog-muted">loading…</p>}
          {!loading && entries.length === 0 && <p className="blog-muted">be the first to sign.</p>}
          {entries.map((en) => (
            <div key={en.id} className="gb-entry">
              <div className="gb-entry__head">
                <span className="gb-name mono">{en.name}</span>
                <time className="gb-time mono">{formatDateTime(en.created_at)}</time>
              </div>
              <p className="gb-msg">{en.message}</p>
              <div className="gb-entry__foot">
                <button
                  className={"gb-like" + (liked.has(en.id) ? " gb-like--on" : "")}
                  onClick={() => onLike(en.id)}
                  disabled={liked.has(en.id)}
                  aria-label="Like this message"
                >
                  ♥{en.likes > 0 ? ` ${en.likes}` : ""}
                </button>
                {en.owner_liked && (
                  <span className="gb-owner-like mono">♥ Liked by luraph</span>
                )}
                {isOwner && (
                  <button
                    className="gb-owner-toggle mono"
                    onClick={() => onOwnerLike(en.id, en.owner_liked)}
                  >
                    {en.owner_liked ? "unlike" : "like as owner"}
                  </button>
                )}
                {isOwner && replyTo !== en.id && (
                  <button className="gb-owner-toggle mono" onClick={() => startReply(en)}>
                    {en.owner_reply ? "edit reply" : "reply"}
                  </button>
                )}
              </div>

              {replyTo === en.id ? (
                <div className="gb-reply gb-reply--form">
                  <textarea
                    className="gb-input gb-textarea mono"
                    placeholder="reply as owner…"
                    maxLength={280}
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="gb-reply__actions">
                    <button className="btn-sm" onClick={() => saveReply(en.id)}>
                      {replyText.trim() ? "send" : "clear"}
                    </button>
                    <button className="btn-sm btn-ghost" onClick={() => setReplyTo(null)}>
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                en.owner_reply && (
                  <div className="gb-reply">
                    <img className="gb-reply__pfp" src={owner?.avatarUrl} alt="" aria-hidden="true" />
                    <div className="gb-reply__body">
                      <div className="gb-reply__head">
                        <span className="gb-name mono">
                          {owner?.globalName ?? owner?.username ?? "luraph"}
                        </span>
                        {en.owner_reply_at && (
                          <time className="gb-time mono">{formatDateTime(en.owner_reply_at)}</time>
                        )}
                      </div>
                      <p className="gb-msg">{en.owner_reply}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
