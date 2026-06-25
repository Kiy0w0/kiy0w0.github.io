import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addFriend,
  fetchSummaries,
  listFriends,
  removeFriend,
  type Friend,
  type SteamSummary,
} from "../lib/steam";
import { useAuth } from "../hooks/useAuth";

export function Friends() {
  const { isOwner } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SteamSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const f = await listFriends();
      setFriends(f);
      setError(null);
      const players = await fetchSummaries(f.map((x) => x.steamid));
      setSummaries(Object.fromEntries(players.map((p) => [p.steamid, p])));
    } catch (e) {
      setError((e as Error).message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd() {
    const v = input.trim();
    if (!v) return;
    setBusy(true);
    setError(null);
    try {
      await addFriend(v, note.trim());
      setInput("");
      setNote("");
      await load();
    } catch (e) {
      setError((e as Error).message ?? "Add failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(f: Friend) {
    if (!confirm("Remove this friend?")) return;
    await removeFriend(f.id);
    setFriends((prev) => prev.filter((x) => x.id !== f.id));
  }

  const onlineCount = useMemo(
    () => friends.filter((f) => summaries[f.steamid]?.online).length,
    [friends, summaries],
  );

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <header className="blog-head">
          <Link to="/" className="blog-back mono">← home</Link>
          <h1 className="blog-title">friends</h1>
          <p className="blog-muted">
            {friends.length} on steam · {onlineCount} online
          </p>
        </header>

        {isOwner && (
          <div className="photo-upload">
            <input
              className="field__input"
              placeholder="steam profile url or id"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              className="field__input"
              placeholder="note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button disabled={busy} onClick={onAdd}>{busy ? "adding…" : "add"}</button>
          </div>
        )}

        {loading && <p className="blog-muted blog-state">loading…</p>}
        {error && <p className="field-error mono blog-state">{error}</p>}
        {!loading && !error && friends.length === 0 && (
          <p className="blog-muted blog-state">no friends pinned yet.</p>
        )}

        <div className="friend-grid">
          {friends.map((f) => {
            const s = summaries[f.steamid];
            return (
              <div key={f.id} className="friend-card">
                <a
                  href={s?.url ?? `https://steamcommunity.com/profiles/${f.steamid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="friend-link"
                >
                  <div className="friend-avatar-wrap">
                    {s?.avatar ? (
                      <img src={s.avatar} alt="" loading="lazy" />
                    ) : (
                      <div className="friend-avatar-blank" />
                    )}
                    <span
                      className={"friend-dot" + (s?.online ? " friend-dot--on" : "")}
                      title={s?.online ? "online" : "offline"}
                    />
                  </div>
                  <div className="friend-info">
                    <span className="friend-name">{s?.name ?? f.steamid}</span>
                    <span className="friend-status mono">
                      {s ? (s.online ? "online" : "offline") : "…"}
                    </span>
                    {f.note && <span className="friend-note">{f.note}</span>}
                  </div>
                </a>
                {isOwner && (
                  <button className="btn-sm btn-ghost friend-del" onClick={() => onRemove(f)}>
                    del
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
