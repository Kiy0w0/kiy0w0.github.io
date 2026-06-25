// Re-encode an image through a canvas. This both shrinks the file (resize +
// webp) AND strips all metadata (EXIF, GPS) as a side effect, because the
// canvas export writes a clean image with no original metadata carried over.
export async function processImage(
  file: File,
  maxDim = 2000,
  quality = 0.82,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // canvas would kill animation

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies EXIF orientation so phone photos don't come out rotated.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // decode failed / unsupported → upload original
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}
