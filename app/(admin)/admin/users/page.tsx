import Link from "next/link";
import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { formatWhen } from "@/lib/admin/format";
import { loadUsers } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";
import { PLAN_LABEL } from "@/lib/billing/plans";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const users = await loadUsers(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title={`Utilisateurs · ${users.length}`}>
        {users.length === 0 ? (
          <Empty>Aucun compte.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Utilisateur</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Projets</th>
                  <th className="px-4 py-2 font-medium">Dernier événement</th>
                  <th className="px-4 py-2 font-medium">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-[12px] text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-2.5">{PLAN_LABEL[user.plan]}</td>
                    <td className="px-4 py-2.5 tabular-nums">{user.projects}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{user.lastEvent ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatWhen(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Voir aussi <Link href="/admin/sessions" className="underline">les sessions</Link>.
      </p>
    </>
  );
}
