import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Thèmes" };

export default function ThemesPage() {
  return (
    <section>
      <PageHead title="6 thèmes prêts">
        {"Chaque thème = couleurs, typos, arrondis et ombres. Un par projet, plus deux thèmes libres. Style Dribbble/Behance : une couleur d'accent forte, beaucoup d'espace, une typo de titre avec du caractère."}
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
