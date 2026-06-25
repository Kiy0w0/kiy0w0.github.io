import { Link } from "react-router-dom";
import { formatDateTime, type Post } from "../../lib/blog";

export function PostRow({ post, folderName }: { post: Post; folderName?: string }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={"post-row" + (post.cover_url ? " post-row--cover" : "")}
    >
      {post.cover_url && (
        <img src={post.cover_url} alt="" className="post-row__cover" loading="lazy" />
      )}
      <div className="post-row__main">
        <span className="post-row__title">
          {post.title}
          {!post.published && <span className="badge-draft">draft</span>}
        </span>
        {post.excerpt && <span className="post-row__excerpt">{post.excerpt}</span>}
      </div>
      <time className="post-row__meta mono">
        {formatDateTime(post.created_at)}
        {folderName ? ` · ${folderName}` : ""}
      </time>
    </Link>
  );
}
