import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  addProject,
  listProjects,
  removeProject,
  type Project,
  type ProjectInput,
} from "../lib/portfolio";
import { uploadImage } from "../lib/photos";
import { deleteFromImageKit, ikUrl } from "../lib/imagekit";
import { useAuth } from "../hooks/useAuth";
import { useMeta, titled } from "../lib/meta";

const STATUS: Project["status"][] = ["live", "wip", "archived"];
const empty: ProjectInput = {
  title: "",
  blurb: "",
  url: "",
  repo: "",
  cover: "",
  cover_id: null,
  tags: [],
  category: "",
  status: "live",
  pos: 0,
};

export function Portfolio() {
  const { isOwner } = useAuth();
  useMeta({ title: titled("portfolio"), description: "things i've built" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [cat, setCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProjectInput>(empty);
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    listProjects()
      .then((p) => alive && (setProjects(p), setError(null)))
      .catch((e) => alive && setError(e.message ?? "Failed to load"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const cats = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(),
    [projects],
  );
  const visible = useMemo(
    () => (cat ? projects.filter((p) => p.category === cat) : projects),
    [projects, cat],
  );

  async function onAdd() {
    if (!form.title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      let cover = form.cover;
      let cover_id = form.cover_id;
      const file = fileRef.current?.files?.[0];
      if (file) cover = await uploadImage(file);
      const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      const p = await addProject({ ...form, cover, cover_id, tags, pos: projects.length });
      setProjects((prev) => [...prev, p]);
      setForm(empty);
      setTagsRaw("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError((e as Error).message ?? "Add failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(p: Project) {
    if (!confirm("Delete this project?")) return;
    if (p.cover_id) await deleteFromImageKit(p.cover_id).catch(() => {});
    await removeProject(p.id);
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <header className="blog-head">
          <Link to="/" className="blog-back mono">← home</Link>
          <h1 className="blog-title">portfolio</h1>
          <p className="blog-muted">{visible.length} things i've built</p>
        </header>

        {isOwner && (
          <div className="photo-upload">
            <input ref={fileRef} type="file" accept="image/*" className="field__input" />
            <input className="field__input" placeholder="title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="field__input" placeholder="blurb" value={form.blurb}
              onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
            <input className="field__input" placeholder="live url" value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <input className="field__input" placeholder="repo url" value={form.repo}
              onChange={(e) => setForm({ ...form, repo: e.target.value })} />
            <input className="field__input" placeholder="category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="field__input" placeholder="tags, comma sep" value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)} />
            <select className="field__input" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Project["status"] })}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button disabled={busy} onClick={onAdd}>{busy ? "adding…" : "add"}</button>
          </div>
        )}

        {cats.length > 0 && (
          <div className="folder-chips" role="tablist" aria-label="Categories">
            <button className={"chip" + (cat === null ? " chip--on" : "")} onClick={() => setCat(null)}>all</button>
            {cats.map((c) => (
              <button key={c} className={"chip" + (cat === c ? " chip--on" : "")} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}

        {loading && <p className="blog-muted blog-state">loading…</p>}
        {error && <p className="field-error mono blog-state">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="blog-muted blog-state">nothing built yet.</p>
        )}

        <div className="proj-grid">
          {visible.map((p) => (
            <article key={p.id} className="proj-card">
              {p.cover && (
                <div className="proj-cover">
                  <img src={p.cover_id ? ikUrl(p.cover, { w: 600, c: "maintain_ratio", f: "auto" }) : p.cover} alt="" loading="lazy" />
                </div>
              )}
              <div className="proj-body">
                <div className="proj-head">
                  <h2 className="proj-title">{p.title}</h2>
                  <span className={"proj-badge mono proj-badge--" + p.status}>{p.status}</span>
                </div>
                {p.blurb && <p className="proj-blurb">{p.blurb}</p>}
                {p.tags.length > 0 && (
                  <div className="proj-tags">
                    {p.tags.map((t) => <span key={t} className="proj-tag mono">{t}</span>)}
                  </div>
                )}
                <div className="proj-links mono">
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer">live ↗</a>}
                  {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">code ↗</a>}
                  {isOwner && <button className="btn-sm btn-ghost" onClick={() => onDelete(p)}>del</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
