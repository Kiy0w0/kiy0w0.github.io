import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { deletePhoto, listPhotos, uploadPhoto, type Photo } from "../lib/photos";
import { formatDateTime } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";

export function Photography() {
  const { isOwner } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [album, setAlbum] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listPhotos()
      .then((p) => {
        if (!alive) return;
        setPhotos(p);
        setError(null);
      })
      .catch((e) => alive && setError(e.message ?? "Failed to load"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const albums = useMemo(
    () => [...new Set(photos.map((p) => p.album).filter(Boolean))].sort(),
    [photos],
  );
  const visible = useMemo(
    () => (album ? photos.filter((p) => p.album === album) : photos),
    [photos, album],
  );

  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const photo = await uploadPhoto(file, caption.trim(), uploadAlbum.trim());
      setPhotos((prev) => [photo, ...prev]);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(photo: Photo) {
    if (!confirm("Delete this photo?")) return;
    await deletePhoto(photo);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  return (
    <main className="page blog">
      <div className="blog-wrap photo-wrap">
        <header className="blog-head">
          <Link to="/" className="blog-back mono">← home</Link>
          <h1 className="blog-title">photography</h1>
          <p className="blog-muted">{visible.length} shots</p>
        </header>

        {isOwner && (
          <div className="photo-upload">
            <input ref={fileRef} type="file" accept="image/*" className="field__input" />
            <input
              className="field__input"
              placeholder="caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <input
              className="field__input"
              placeholder="album (optional)"
              value={uploadAlbum}
              onChange={(e) => setUploadAlbum(e.target.value)}
            />
            <button disabled={busy} onClick={onUpload}>{busy ? "uploading…" : "upload"}</button>
          </div>
        )}

        {albums.length > 0 && (
          <div className="folder-chips" role="tablist" aria-label="Albums">
            <button
              className={"chip" + (album === null ? " chip--on" : "")}
              onClick={() => setAlbum(null)}
            >
              all
            </button>
            {albums.map((a) => (
              <button
                key={a}
                className={"chip" + (album === a ? " chip--on" : "")}
                onClick={() => setAlbum(a)}
              >
                {a}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="blog-muted blog-state">loading…</p>}
        {error && <p className="field-error mono blog-state">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="blog-muted blog-state">no photos yet.</p>
        )}

        <div className="photo-grid">
          {visible.map((p) => (
            <figure key={p.id} className="photo-cell">
              <img
                src={p.url}
                alt={p.caption || "photo"}
                loading="lazy"
                onClick={() => setLightbox(p)}
              />
              <figcaption className="photo-cap">
                <span className="photo-cap__text">
                  {p.caption && <span className="photo-cap__caption">{p.caption}</span>}
                  <time className="photo-cap__time mono">{formatDateTime(p.created_at)}</time>
                </span>
                {isOwner && (
                  <button className="btn-sm btn-ghost" onClick={() => onDelete(p)}>del</button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption || "photo"} />
        </div>
      )}
    </main>
  );
}
