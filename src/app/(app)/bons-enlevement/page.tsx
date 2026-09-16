import { redirect } from "next/navigation";

export default function BonsEnlevementPage() {
  redirect("/documents?type=BON_ENLEVEMENT");
}
