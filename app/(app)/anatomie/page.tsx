import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Anatomie" };

export default function AnatomiePage() {
  return (
    <section>
      <PageHead title="Une landing = un tunnel de 12 frames">
        {'Chaque frame a un seul rôle. Le visiteur descend et on lui fait passer 4 étapes : il remarque, il comprend, il a envie, il clique. Plus on descend, moins il reste de monde, donc le haut de page compte le plus.'}
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
