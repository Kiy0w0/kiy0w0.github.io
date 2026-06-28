import { supabase } from "./supabase";
import { processImage } from "./image";
import { uploadToImageKit, deleteFromImageKit, ikUrl } from "./imagekit";

export type Photo = {
  id: string;
  url: string;
  path: string;
  public_id: string | null;
  caption: string;
  album: string;
  created_at: string;
};

export async function listPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadPhoto(file: File, caption: string, album: string): Promise<Photo> {
  const processed = await processImage(file);
  const folder = album ? `/ngayon/photos/${album}` : "/ngayon/photos";
  const up = await uploadToImageKit(processed, folder);

  const { data, error } = await supabase
    .from("photos")
    .insert({ url: up.url, path: up.filePath, public_id: up.fileId, caption, album })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadImage(file: File): Promise<string> {
  const processed = await processImage(file);
  const up = await uploadToImageKit(processed, "/ngayon/blog");
  return up.url;
}

export async function deletePhoto(photo: Photo): Promise<void> {
  if (photo.public_id) {
    await deleteFromImageKit(photo.public_id).catch(() => {});
  } else if (photo.path && !photo.path.includes("/")) {
    await supabase.storage.from("photos").remove([photo.path]).catch(() => {});
  }
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}

export function photoThumb(p: Photo, w = 600): string {
  return p.public_id ? ikUrl(p.path || p.url, { w, c: "maintain_ratio", f: "auto" }) : p.url;
}

export function photoFull(p: Photo, w = 1920): string {
  return p.public_id ? ikUrl(p.path || p.url, { w, c: "at_max", f: "auto" }) : p.url;
}
