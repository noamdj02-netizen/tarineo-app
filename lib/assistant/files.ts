/** Fichier collé dans le prompt, envoyé à Claude (image, PDF ou texte). */
export type AssistantFile = {
  name: string;
  mime: string;
  size: number;
  /** Base64, sans le préfixe data: */
  data: string;
};

export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

const IMAGES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const TEXTS = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
]);

export function fileKind(mime: string): "image" | "pdf" | "text" | null {
  if (IMAGES.has(mime)) return "image";
  if (mime === "application/pdf") return "pdf";
  if (TEXTS.has(mime) || mime.startsWith("text/")) return "text";
  return null;
}

export function acceptFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) return `${file.name} dépasse 2 Mo.`;
  if (!fileKind(file.type || guessMime(file.name))) {
    return `${file.name} : image, PDF ou fichier texte seulement.`;
  }
  return null;
}

export function guessMime(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "md") return "text/markdown";
  if (ext === "csv") return "text/csv";
  if (ext === "json") return "application/json";
  if (ext === "txt") return "text/plain";
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "";
}

export async function readAsAssistantFile(file: File): Promise<AssistantFile> {
  const mime = file.type || guessMime(file.name) || "application/octet-stream";
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? "");
      resolve(s.includes(",") ? s.slice(s.indexOf(",") + 1) : s);
    };
    r.onerror = () => reject(new Error("Lecture impossible"));
    r.readAsDataURL(file);
  });
  return { name: file.name.slice(0, 120), mime, size: file.size, data };
}
