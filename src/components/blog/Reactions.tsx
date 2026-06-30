import { useEffect, useRef, useState } from "react";
import {
  listReactions,
  myReactions,
  toggleReaction,
  type ReactionCount,
} from "../../lib/reactions";

const QUICK = ["👍", "❤️", "🔥", "😂", "👀", "💀"];

export function Reactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<ReactionCount[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    setMine(myReactions(slug));
    listReactions(slug).then((r) => alive && setCounts(r));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  async function react(emoji: string) {
    const e = emoji.trim();
    if (!e || busy) return;
    setBusy(e);
    const had = mine.has(e);
    const next = new Map(counts.map((c) => [c.emoji, c.count]));
    next.set(e, Math.max(0, (next.get(e) ?? 0) + (had ? -1 : 1)));
    setCounts(
      [...next.entries()]
        .filter(([, n]) => n > 0)
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((a, b) => b.count - a.count),
    );
    const nm = new Set(mine);
    had ? nm.delete(e) : nm.add(e);
    setMine(nm);
    const res = await toggleReaction(slug, e);
    if (!res) {
      setMine(myReactions(slug));
      listReactions(slug).then(setCounts);
    }
    setBusy(null);
  }

  const present = new Set(counts.map((c) => c.emoji));
  const quick = QUICK.filter((e) => !present.has(e));

  return (
    <div className="reactions">
      {counts.map((c) => (
        <button
          key={c.emoji}
          className={"react-chip" + (mine.has(c.emoji) ? " react-chip--on" : "")}
          onClick={() => react(c.emoji)}
          disabled={busy === c.emoji}
        >
          <span className="react-emoji">{c.emoji}</span>
          <span className="react-count mono">{c.count}</span>
        </button>
      ))}

      {quick.map((e) => (
        <button
          key={e}
          className="react-chip react-chip--ghost"
          onClick={() => react(e)}
          aria-label={`react ${e}`}
        >
          <span className="react-emoji">{e}</span>
        </button>
      ))}

      {adding ? (
        <input
          ref={inputRef}
          className="react-input"
          maxLength={8}
          placeholder="emoji"
          aria-label="custom emoji (Win + .)"
          onBlur={() => setAdding(false)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              const v = (ev.target as HTMLInputElement).value;
              if (v.trim()) react(v);
              (ev.target as HTMLInputElement).value = "";
              setAdding(false);
            } else if (ev.key === "Escape") {
              setAdding(false);
            }
          }}
        />
      ) : (
        <button
          className="react-chip react-chip--add"
          onClick={() => setAdding(true)}
          aria-label="add custom reaction"
          title="add emoji (Win + .)"
        >
          +
        </button>
      )}
    </div>
  );
}
