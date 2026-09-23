import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { MobileHub } from "@/components/tarineo/mobile/MobileHub";

export default async function PlusPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <MobilePageHeader title="Menu" subtitle="Toutes les sections" backHref="/compte" />
      <MobileHub />
      <p className="hidden text-sm text-muted-foreground lg:block">
        Sur ordinateur, utilisez le menu latéral pour accéder à ces sections.
      </p>
    </div>
  );
}
