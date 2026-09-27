import { redirect } from "next/navigation";
import { R } from "@/lib/routes";

export default function RedirectPage() {
  redirect(R.client);
}
