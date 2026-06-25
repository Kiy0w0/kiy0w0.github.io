import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createFolder,
  createPost,
  getPostById,
  listFolders,
  slugify,
  updatePost,
  type Folder,
  type PostInput,
} from "../lib/blog";
import { MarkdownView } from "../components/blog/MarkdownView";

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFolders().then(setFolders).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    getPostById(id).then((p) => {
      if (!p) return;
      setTitle(p.title);
      setSlug(p.slug);
      setSlugTouched(true);
      setExcerpt(p.excerpt);
      setBody(p.body);
      setFolderId(p.folder_id);
      setPublished(p.published);
    });
  }, [id]);

  function onTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onCreateFolder() {
    const name = newFolder.trim();
    if (!name) return;
    const f = await createFolder(name);
    setFolders((prev) => [...prev, f]);
    setFolderId(f.id);
    setNewFolder("");
  }

  async function onSave() {
    setBusy(true);
    setError(null);
    const input: PostInput = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim(),
      body,
      folder_id: folderId,
      published,
    };
    try {
      if (editing && id) await updatePost(id, input);
      else await createPost(input);
      navigate(`/blog/${input.slug}`);
    } catch (e) {
      setError((e as Error).message ?? "Save failed");
      setBusy(false);
    }
  }

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <Link to="/blog" className="blog-back mono">← writing</Link>
        <h1 className="blog-title">{editing ? "edit post" : "new post"}</h1>

        <div className="blog-form">
          <label className="field">
            <span className="field__label mono">title</span>
            <input className="field__input" value={title} onChange={(e) => onTitle(e.target.value)} />
          </label>

          <label className="field">
            <span className="field__label mono">slug</span>
            <input
              className="field__input mono"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </label>

          <label className="field">
            <span className="field__label mono">folder</span>
            <select
              className="field__input"
              value={folderId ?? ""}
              onChange={(e) => setFolderId(e.target.value || null)}
            >
              <option value="">— none —</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>

          <div className="field field--row">
            <input
              className="field__input"
              placeholder="new folder name"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />
            <button type="button" className="btn-sm" onClick={onCreateFolder}>add folder</button>
          </div>

          <label className="field">
            <span className="field__label mono">excerpt</span>
            <input className="field__input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </label>

          <label className="field">
            <span className="field__label mono">
              body (markdown)
              <button type="button" className="link-toggle" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? "edit" : "preview"}
              </button>
            </span>
            {showPreview ? (
              <MarkdownView source={body} />
            ) : (
              <textarea
                className="field__input field__textarea mono"
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            )}
          </label>

          {error && <p className="field-error mono">{error}</p>}
        </div>
      </div>

      <div className="save-bar">
        <label className="publish-toggle">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span>published</span>
        </label>
        <button disabled={busy || !title.trim()} onClick={onSave}>
          {busy ? "saving…" : editing ? "update" : "save"}
        </button>
      </div>
    </main>
  );
}
