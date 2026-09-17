/** Échappe le texte avant interpolation dans un email HTML. */
export function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Transforme des paragraphes en blocs <p> avec espacement Figma. */
export function paragraphesHtml(lignes: string[]): string {
  return lignes
    .map(
      (ligne, i) =>
        `<p style="margin:0 0 ${i < lignes.length - 1 ? "12px" : "0"};font-size:16px;line-height:1.5;color:#14171e;opacity:0.8;text-align:center;">${ligne}</p>`,
    )
    .join("");
}
