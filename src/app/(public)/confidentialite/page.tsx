import { permanentRedirect } from "next/navigation";

export default function ConfidentialiteRedirectPage() {
  permanentRedirect("/legal/confidentialite");
}
