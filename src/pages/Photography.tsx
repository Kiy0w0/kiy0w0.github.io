import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { deletePhoto, listPhotos, uploadPhoto, photoThumb, photoFull, type Photo } from "../lib/photos";
import { formatDateTime } from "../lib/blog";
import { useAuth } from "../hooks/useAuth";
import { useMeta, titled } from "../lib/meta";

export function Photography() {
  const { isOwner } = useAuth();
  useMeta({ title: titled("photography"), description: "photos i've taken" });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [album, setAlbum] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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

  const lightbox = lightboxIdx !== null ? visible[lightboxIdx] ?? null : null;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const nextLightbox = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i + 1) % visible.length)),
    [visible.length],
  );
  const prevLightbox = useCallback(
    () =>
      setLightboxIdx((i) =>
        i === null ? null : (i - 1 + visible.length) % visible.length,
      ),
    [visible.length],
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextLightbox();
      else if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxIdx, closeLightbox, nextLightbox, prevLightbox]);

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
          {visible.map((p, i) => (
            <figure key={p.id} className="photo-cell">
              <img
                src={photoThumb(p)}
                alt={p.caption || "photo"}
                loading="lazy"
                onClick={() => setLightboxIdx(i)}
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
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption || "photo"}
          onClick={closeLightbox}
        >
          <button
            className="lightbox__btn lightbox__close"
            aria-label="close"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            ×
          </button>
          {visible.length > 1 && (
            <>
              <button
                className="lightbox__btn lightbox__prev"
                aria-label="previous"
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
              >
                ‹
              </button>
              <button
                className="lightbox__btn lightbox__next"
                aria-label="next"
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              >
                ›
              </button>
            </>
          )}
          <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <img src={photoFull(lightbox)} alt={lightbox.caption || "photo"} />
            <figcaption className="lightbox__cap">
              {lightbox.caption && (
                <span className="lightbox__caption-text">{lightbox.caption}</span>
              )}
              <span className="lightbox__meta mono">
                <time>{formatDateTime(lightbox.created_at)}</time>
                {visible.length > 1 && (
                  <span> · {(lightboxIdx ?? 0) + 1} / {visible.length}</span>
                )}
                <a
                  href={lightbox.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lightbox__open"
                >
                  open original ↗
                </a>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}
