import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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

  // Wrap the current selection (or a placeholder) with markdown markers.
  function wrap(before: string, after: string, placeholder: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + sel + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + sel.length;
    });
  }

  // Insert a marker at the start of the current line (headings, lists, quotes).
  function prefixLine(prefix: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const lineStart = body.lastIndexOf("\n", pos - 1) + 1;
    setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    const caret = pos + prefix.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = caret;
    });
  }

  function onBodyKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") {
      e.preventDefault();
      wrap("**", "**", "bold");
    } else if (k === "i") {
      e.preventDefault();
      wrap("*", "*", "italic");
    }
  }

  const mdTools = [
    { label: "B", title: "Bold (Ctrl+B)", run: () => wrap("**", "**", "bold") },
    { label: "I", title: "Italic (Ctrl+I)", run: () => wrap("*", "*", "italic") },
    { label: "S", title: "Strikethrough", run: () => wrap("~~", "~~", "text") },
    { label: "H", title: "Heading", run: () => prefixLine("## ") },
    { label: "❝", title: "Quote", run: () => prefixLine("> ") },
    { label: "•", title: "List", run: () => prefixLine("- ") },
    { label: "</>", title: "Inline code", run: () => wrap("`", "`", "code") },
    { label: "▤", title: "Code block", run: () => wrap("```\n", "\n```", "code") },
    { label: "link", title: "Link", run: () => wrap("[", "](https://)", "text") },
  ];

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
              <>
                <div className="md-toolbar">
                  {mdTools.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      className="md-btn"
                      title={t.title}
                      onClick={t.run}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={bodyRef}
                  className="field__input field__textarea mono"
                  rows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={onBodyKey}
                />
              </>
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
