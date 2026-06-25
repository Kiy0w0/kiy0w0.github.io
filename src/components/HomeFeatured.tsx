import { useEffect, useState } from "react";
import { getFeatured, listPosts, saveFeatured, type Featured, type Post } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { PostRow } from "./blog/PostRow";

export function HomeFeatured() {
  const { isOwner } = useAuth();
  const [data, setData] = useState<Featured | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Featured>({ heading: "Latest blog", slugs: [] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getFeatured(), listPosts()]).then(([f, p]) => {
      if (!alive) return;
      setData(f);
      setPosts(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const bySlug = (slug: string) => posts.find((p) => p.slug === slug);

  function startEdit() {
    setDraft(data ?? { heading: "Latest blog", slugs: [] });
    setEditing(true);
  }

  function toggle(slug: string) {
    setDraft((d) => {
      if (d.slugs.includes(slug)) return { ...d, slugs: d.slugs.filter((s) => s !== slug) };
      if (d.slugs.length >= 3) return d;
      return { ...d, slugs: [...d.slugs, slug] };
    });
  }

  async function save() {
    setBusy(true);
    const clean = { heading: draft.heading.trim() || "Latest blog", slugs: draft.slugs.slice(0, 3) };
    const ok = await saveFeatured(clean);
    setBusy(false);
    if (ok) {
      setData(clean);
      setEditing(false);
    }
  }

  if (!data) return null;
  const featuredPosts = data.slugs.map(bySlug).filter(Boolean) as Post[];
  if (!editing && featuredPosts.length === 0 && !isOwner) return null;

  return (
    <div className="featured">
      {editing ? (
        <div className="featured-edit">
          <input
            className="featured-input mono"
            value={draft.heading}
            onChange={(e) => setDraft((d) => ({ ...d, heading: e.target.value }))}
            placeholder="heading"
            maxLength={40}
          />
          <p className="featured-hint mono">pick up to 3 ({draft.slugs.length}/3)</p>
          <div className="featured-picklist">
            {posts.map((p) => (
              <label key={p.id} className="featured-pick">
                <input
                  type="checkbox"
                  checked={draft.slugs.includes(p.slug)}
                  onChange={() => toggle(p.slug)}
                  disabled={!draft.slugs.includes(p.slug) && draft.slugs.length >= 3}
                />
                <span>{p.title}</span>
              </label>
            ))}
          </div>
          <div className="featured-edit__actions">
            <button className="btn-sm" onClick={save} disabled={busy}>
              {busy ? "saving…" : "save"}
            </button>
            <button className="btn-sm btn-ghost" onClick={() => setEditing(false)}>cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="featured-head">
            <span className="featured-heading mono">{data.heading}</span>
            {isOwner && (
              <button className="featured-editbtn mono" onClick={startEdit}>edit</button>
            )}
          </div>
          <div className="featured-rows">
            {featuredPosts.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
