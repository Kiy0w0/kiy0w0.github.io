import { Link } from "react-router-dom";
import { useMeta } from "../lib/meta";

export function NotFound() {
  useMeta({ title: "404 · Kuromi" });
  return (
    <main className="page blog">
      <div className="blog-wrap notfound">
        <h1 className="nf-code mono">404</h1>
        <p className="blog-muted">this page doesn't exist.</p>
        <Link to="/" className="btn-sm">← home</Link>
      </div>
    </main>
  );
}
