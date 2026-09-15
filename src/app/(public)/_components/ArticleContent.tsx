import type { BlocArticle } from "@/lib/blog";

export function ArticleContent({ blocs }: { blocs: BlocArticle[] }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-foreground/90">
      {blocs.map((bloc, i) => {
        if (bloc.type === "h2") {
          return (
            <h2 key={i} className="pt-2 text-xl font-bold text-white">
              {bloc.texte}
            </h2>
          );
        }
        if (bloc.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-muted">
              {bloc.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{bloc.texte}</p>;
      })}
    </div>
  );
}
