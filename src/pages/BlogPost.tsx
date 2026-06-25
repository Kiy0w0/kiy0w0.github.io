import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deletePost,
  formatDateTime,
  getPostBySlug,
  listFolders,
  type Post,
} from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { MarkdownView } from "../components/blog/MarkdownView";
import { useMeta } from "../lib/meta";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [folderName, setFolderName] = useState<string>("");
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    getPostBySlug(slug ?? "")
      .then(async (p) => {
        if (!alive) return;
        if (!p) {
          setState("missing");
          return;
        }
        setPost(p);
        setState("ready");
        if (p.folder_id) {
          const folders = await listFolders();
          if (alive) setFolderName(folders.find((f) => f.id === p.folder_id)?.name ?? "");
        }
      })
      .catch(() => alive && setState("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);

  useMeta({
    title: post ? `${post.title} · kiy0w0` : "blog · kiy0w0",
    description: post?.excerpt,
    image: post?.cover_url || undefined,
  });

  async function onDelete() {
    if (!post) return;
    if (!confirm("Delete this post?")) return;
    await deletePost(post.id);
    navigate("/blog");
  }

  if (state === "loading")
    return (
      <main className="page blog">
        <div className="blog-wrap">
          <p className="blog-muted">loading…</p>
        </div>
      </main>
    );

  if (state === "missing" || !post)
    return (
      <main className="page blog">
        <div className="blog-wrap">
          <Link to="/blog" className="blog-back mono">← writing</Link>
          <p className="blog-muted blog-state">post not found.</p>
        </div>
      </main>
    );

  return (
    <main className="page blog">
      <article className="blog-wrap blog-article">
        <Link to="/blog" className="blog-back mono">← writing</Link>
        {post.cover_url && <img src={post.cover_url} alt="" className="post-cover" />}
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta mono">
          {formatDateTime(post.created_at)}
          {folderName ? ` · ${folderName}` : ""}
          {!post.published && " · draft"}
        </div>

        {isOwner && (
          <div className="blog-owner post-owner">
            <Link to={`/blog/edit/${post.id}`} className="btn-sm">edit</Link>
            <button className="btn-sm btn-ghost" onClick={onDelete}>delete</button>
          </div>
        )}

        <MarkdownView source={post.body} />
      </article>
    </main>
  );
}
