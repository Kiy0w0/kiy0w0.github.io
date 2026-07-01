import { supabase } from "./supabase";
import { uploadToImageKit, deleteFromImageKit } from "./imagekit";
import { fileHostBase } from "./host";

export type HostedFile = {
  slug: string;
  ik_url: string;
  ik_file_id: string | null;
  content_type: string | null;
  size: number | null;
  created_at: string;
};

export const MAX_SIZE = 10 * 1024 * 1024;

function randSlug(len = 7): string {
  const abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const b = crypto.getRandomValues(new Uint8Array(len));
  let s = "";
  for (let i = 0; i < len; i++) s += abc[b[i] % abc.length];
  return s;
}

function extOf(name: string): string {
  const m = name.match(/\.([A-Za-z0-9]+)$/);
  return m ? m[1].toLowerCase() : "bin";
}

export function fileUrl(f: HostedFile): string {
  const ext = extOf(f.ik_url) || "bin";
  return `${fileHostBase}/${f.slug}.${ext}`;
}

export async function listFiles(): Promise<HostedFile[]> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadFile(file: File): Promise<HostedFile> {
  if (file.size > MAX_SIZE) throw new Error("File over 10 MB");
  const ext = extOf(file.name);
  const slug = randSlug();
  const named = new File([file], `${slug}.${ext}`, { type: file.type });
  const up = await uploadToImageKit(named, "/ngayon/files");

  const { data, error } = await supabase
    .from("files")
    .insert({
      slug,
      ik_url: up.url,
      ik_file_id: up.fileId,
      content_type: file.type || null,
      size: file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFile(f: HostedFile): Promise<void> {
  if (f.ik_file_id) await deleteFromImageKit(f.ik_file_id).catch(() => {});
  const { error } = await supabase.from("files").delete().eq("slug", f.slug);
  if (error) throw error;
}
