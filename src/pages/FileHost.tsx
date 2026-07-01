import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMeta } from "../lib/meta";
import { deleteFile, fileUrl, listFiles, uploadFile, type HostedFile } from "../lib/files";

const DECOY_VIDEO = "https://file.garden/ah6UIxtAklyoF-jt/sobi.mp4";

function Decoy() {
  useMeta({ title: "chaewon", description: "Hello there! ! !" });
  return (
    <main className="filehost-decoy">
      <video src={DECOY_VIDEO} autoPlay loop muted playsInline className="filehost-decoy__vid" />
      <p className="filehost-decoy__text mono">Hello there! ! !</p>
    </main>
  );
}

function Uploader() {
  useMeta({ title: "files · chaewon", description: "upload" });
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listFiles().then(setFiles).catch((e) => setErr(String(e.message ?? e)));
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = e.clipboardData?.files;
      if (f && f.length) handle(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  async function handle(list: FileList | File[]) {
    const arr = Array.from(list);
    if (!arr.length) return;
    setBusy(true);
    setErr(null);
    for (const f of arr) {
      try {
        const rec = await uploadFile(f);
        setFiles((p) => [rec, ...p]);
        const u = fileUrl(rec);
        await navigator.clipboard.writeText(u).catch(() => {});
        setCopied(u);
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      }
    }
    setBusy(false);
  }

  async function copy(u: string) {
    await navigator.clipboard.writeText(u).catch(() => {});
    setCopied(u);
  }

  async function remove(f: HostedFile) {
    if (!confirm("Delete?")) return;
    try {
      await deleteFile(f);
      setFiles((p) => p.filter((x) => x.slug !== f.slug));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  return (
    <main className="page blog">
      <div className="blog-wrap">
        <h1 className="blog-title">files</h1>
        <div
          className={"filehost-drop" + (drag ? " filehost-drop--on" : "")}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handle(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => e.target.files && handle(e.target.files)}
          />
          <p className="mono">{busy ? "uploading…" : "drop / paste / click — max 10 MB"}</p>
        </div>
        {err && <p className="field-error mono">{err}</p>}
        {copied && <p className="filehost-copied mono">copied {copied}</p>}

        <ul className="filehost-list">
          {files.map((f) => {
            const u = fileUrl(f);
            return (
              <li key={f.slug} className="filehost-item">
                <a href={u} target="_blank" rel="noreferrer" className="filehost-item__slug mono">
                  {f.slug}
                </a>
                <span className="filehost-item__actions">
                  <button className="btn-sm" onClick={() => copy(u)}>copy</button>
                  <button className="btn-sm" onClick={() => remove(f)}>del</button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

export function FileHost() {
  const { isOwner, loading } = useAuth();
  if (loading) return <main className="page blog"><p className="blog-muted">…</p></main>;
  return isOwner ? <Uploader /> : <Decoy />;
}
