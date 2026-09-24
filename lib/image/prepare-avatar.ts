const MAX_BYTES = 2 * 1024 * 1024;
const MAX_EDGE = 512;

/** Redimensionne et compresse pour rester sous la limite des Server Actions. */
export async function prepareAvatarFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (source instanceof ImageBitmap) source.close();
    return file;
  }
  ctx.drawImage(source, 0, 0, w, h);
  if (source instanceof ImageBitmap) source.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );
  if (!blob) return file;

  const out = new File([blob], "avatar.webp", { type: "image/webp" });
  if (out.size > MAX_BYTES) {
    const smaller = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.65),
    );
    if (smaller && smaller.size <= MAX_BYTES) {
      return new File([smaller], "avatar.webp", { type: "image/webp" });
    }
    throw new Error("Image trop lourde même après compression.");
  }
  return out;
}
