"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererEtStockerPdfFacture } from "@/lib/facturesClients";

export async function regenererPdfFacture(clientInvoiceId: string): Promise<{ succes: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false };

  const facture = await prisma.clientInvoice.findFirst({
    where: { id: clientInvoiceId, userId: session.user.id },
    include: { lines: true, clientQuote: { select: { numero: true } } },
  });
  if (!facture) return { succes: false };

  const resultat = await genererEtStockerPdfFacture(
    session.user.id,
    facture,
    facture.lines,
    facture.clientQuote?.numero ?? null
  );
  if (resultat.succes) {
    revalidatePath(`/factures-clients/${clientInvoiceId}`);
  }
  return resultat;
}
