import { supabase } from "./supabase";
import { processImage } from "./image";

export type Photo = {
  id: string;
  url: string;
  path: string;
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
  // Shrink + strip EXIF/GPS before upload.
  const processed = await processImage(file);
  const ext = (processed.name.split(".").pop() ?? "webp").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("photos")
    .upload(path, processed, { cacheControl: "3600", upsert: false, contentType: processed.type });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("photos")
    .insert({ url: pub.publicUrl, path, caption, album })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePhoto(photo: Photo): Promise<void> {
  await supabase.storage.from("photos").remove([photo.path]);
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}
