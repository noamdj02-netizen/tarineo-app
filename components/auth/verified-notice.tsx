import { cookies } from "next/headers";
import { VerifiedNoticeClear } from "@/components/auth/verified-notice-clear";
import { VERIFIED_COOKIE, verifiedKind } from "@/lib/auth/verified";

const COPY = {
  signup: "Compte vérifié. Tu es connecté.",
  login: "Tu es connecté.",
} as const;

export async function VerifiedNotice() {
  const kind = verifiedKind((await cookies()).get(VERIFIED_COOKIE)?.value);
  if (!kind) return null;
  return (
    <div
      role="status"
      className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3 text-[14.5px] leading-relaxed text-ink"
    >
      {COPY[kind]}
      <VerifiedNoticeClear />
    </div>
  );
}
