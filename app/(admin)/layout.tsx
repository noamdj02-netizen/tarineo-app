import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireOwner } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();
  return (
    <AdminShell>
      <Suspense>{children}</Suspense>
    </AdminShell>
  );
}
