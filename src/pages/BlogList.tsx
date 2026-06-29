import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listFolders, listPosts, type Folder, type Post } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { PostRow } from "../components/blog/PostRow";
import { useMeta, titled } from "../lib/meta";
import { isBlogHost, apexUrl } from "../lib/host";

export function BlogList() {
  const { isOwner, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [open, setOpen] = useState<Folder | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useMeta({ title: titled("writing"), description: "notes, thoughts, trashtalk" });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([listPosts({ includeDrafts: isOwner }), listFolders()])
      .then(([p, f]) => {
        if (!alive) return;
        setPosts(p);
        setFolders(f);
        setError(null);
      })
      .catch((e) => alive && setError(e.message ?? "Failed to load"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isOwner]);

  const countByFolder = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of posts) if (p.folder_id) m[p.folder_id] = (m[p.folder_id] ?? 0) + 1;
    return m;
  }, [posts]);

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (q) return `${p.title} ${p.excerpt}`.toLowerCase().includes(q);
      if (open) return p.folder_id === open.id;
      return !p.folder_id;
    });
  }, [posts, open, query]);

  const folderName = (id: string | null) =>
    id ? folders.find((f) => f.id === id)?.name : undefined;

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <header className="blog-head">
          {!open && (isBlogHost ? <a href={apexUrl} className="blog-back mono">← home</a> : <Link to="/" className="blog-back mono">← home</Link>)}
          <div className="blog-head__row">
            <h1 className="blog-title">
              {open && (
                <button
                  className="folder-back mono"
                  onClick={() => setOpen(null)}
                  aria-label="Back to folders"
                >
                  ←
                </button>
              )}
              {open ? open.name : "writing"}
            </h1>
            {isOwner && (
              <div className="blog-owner">
                <Link to="/blog/new" className="btn-sm">+ new</Link>
                <button className="btn-sm btn-ghost" onClick={() => signOut()}>logout</button>
              </div>
            )}
          </div>
          <p className="blog-muted">{visible.length} notes</p>
        </header>

        {!open && (
          <input
            className="blog-search"
            type="search"
            placeholder="search posts"
            aria-label="Search posts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {!open && !searching && folders.length > 0 && (
          <div className="folder-grid">
            {folders.map((f) => (
              <button key={f.id} className="folder-card" onClick={() => setOpen(f)}>
                <span className="folder-card__icon" aria-hidden>📁</span>
                <span className="folder-card__name">{f.name}</span>
                <span className="folder-card__count mono">{countByFolder[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        )}

        {loading && <p className="blog-muted blog-state">loading…</p>}
        {error && <p className="blog-muted blog-state">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="blog-muted blog-state">nothing here yet.</p>
        )}

        <div className="post-list">
          {visible.map((p) => (
            <PostRow
              key={p.id}
              post={p}
              folderName={searching ? folderName(p.folder_id) : undefined}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
