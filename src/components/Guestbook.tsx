import { useEffect, useState } from "react";
import { addEntry, listEntries, type Entry } from "../lib/guestbook";
import { formatDateTime } from "../lib/blog";

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listEntries()
      .then((e) => alive && setEntries(e))
      .catch((e) => alive && setError(e.message ?? "Failed to load"))
      .finally(() => alive && setLoading(false));
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
