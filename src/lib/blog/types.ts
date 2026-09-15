export type BlocArticle =
  | { type: "p"; texte: string }
  | { type: "h2"; texte: string }
  | { type: "ul"; items: string[] };

export interface ArticleBlog {
  slug: string;
  titre: string;
  description: string;
  datePublication: string;
  categorie: string;
  tempsLectureMin: number;
  motsCles: string[];
  contenu: BlocArticle[];
}
