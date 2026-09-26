import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";

export const metadata = { title: "Retours" };

export default function FeedbackPage() {
  return (
    <>
      <RangeBar />
      <Panel title="Retours déclarés">
        <Empty>
          Pas encore de collecte. Quand tu demanderas « pourquoi tu pars », les réponses atterriront ici — à côté des
          raisons inférées dans Churn.
        </Empty>
      </Panel>
    </>
  );
}
