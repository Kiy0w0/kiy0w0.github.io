const ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string | undefined;

export type IKUpload = {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  height: number;
  width: number;
  size: number;
};

async function getAuth(): Promise<{ token: string; expire: number; signature: string }> {
  const r = await fetch("/api/imagekit-auth");
  if (!r.ok) throw new Error(`ImageKit auth failed (${r.status})`);
  return r.json();
}

export async function uploadToImageKit(file: File | Blob, folder = "/ngayon"): Promise<IKUpload> {
  if (!ENDPOINT || !PUBLIC_KEY) throw new Error("ImageKit env missing");
  const { token, expire, signature } = await getAuth();
  const name = file instanceof File ? file.name : "upload";

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", name);
  form.append("publicKey", PUBLIC_KEY);
  form.append("signature", signature);
  form.append("expire", String(expire));
  form.append("token", token);
  form.append("folder", folder);
  form.append("useUniqueFileName", "true");

  const r = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`ImageKit upload failed (${r.status}): ${t.slice(0, 200)}`);
  }
  return r.json();
}

export type IKTransform = {
  w?: number;
  h?: number;
  q?: number;
  f?: "auto" | "webp" | "avif" | "jpg" | "png";
  c?: "maintain_ratio" | "force" | "at_max" | "at_least";
};

export function ikUrl(filePathOrUrl: string, t: IKTransform = {}): string {
  if (!ENDPOINT) return filePathOrUrl;
  let filePath = filePathOrUrl;
  if (filePathOrUrl.startsWith("http")) {
    const i = filePathOrUrl.indexOf("/", filePathOrUrl.indexOf("://") + 3);
    const path = i >= 0 ? filePathOrUrl.slice(i) : "";
    const ep = ENDPOINT.slice(ENDPOINT.indexOf("/", ENDPOINT.indexOf("://") + 3));
    if (path.startsWith(ep)) filePath = path.slice(ep.length);
    else return filePathOrUrl;
  }
  if (!filePath.startsWith("/")) filePath = "/" + filePath;

  const parts: string[] = [];
  if (t.w) parts.push(`w-${t.w}`);
  if (t.h) parts.push(`h-${t.h}`);
  if (t.c) parts.push(`c-${t.c}`);
  parts.push(`q-${t.q ?? 80}`);
  parts.push(`f-${t.f ?? "auto"}`);
  const tr = parts.join(",");

  return `${ENDPOINT}${filePath}?tr=${tr}`;
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  const r = await fetch("/api/imagekit-delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Delete failed (${r.status}): ${t.slice(0, 200)}`);
  }
}
