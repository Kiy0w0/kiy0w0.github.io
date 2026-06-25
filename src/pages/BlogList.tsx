import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listFolders, listPosts, type Folder, type Post } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { FolderChips } from "../components/blog/FolderChips";
import { PostRow } from "../components/blog/PostRow";
import { useMeta, titled } from "../lib/meta";

export function BlogList() {
  const { isOwner, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [active, setActive] = useState<string | null>(null);
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

  const folderById = useMemo(
    () => Object.fromEntries(folders.map((f) => [f.id, f])),
    [folders],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (active && folderById[p.folder_id ?? ""]?.slug !== active) return false;
      if (!q) return true;
      return `${p.title} ${p.excerpt}`.toLowerCase().includes(q);
    });
  }, [posts, active, query, folderById]);

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <header className="blog-head">
          <Link to="/" className="blog-back mono">← home</Link>
          <div className="blog-head__row">
            <h1 className="blog-title">writing</h1>
            {isOwner && (
              <div className="blog-owner">
                <Link to="/blog/new" className="btn-sm">+ new</Link>
                <button className="btn-sm btn-ghost" onClick={() => signOut()}>logout</button>
              </div>
            )}
          </div>
          <p className="blog-muted">{visible.length} notes</p>
        </header>

        <input
          className="blog-search"
          type="search"
          placeholder="search posts"
          aria-label="Search posts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {folders.length > 0 && (
          <FolderChips folders={folders} active={active} onSelect={setActive} />
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
              folderName={folderById[p.folder_id ?? ""]?.name}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
