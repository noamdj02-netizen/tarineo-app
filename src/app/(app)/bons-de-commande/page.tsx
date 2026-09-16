import { redirect } from "next/navigation";

export default function BonsCommandePage() {
  redirect("/documents?type=BON_COMMANDE");
}
