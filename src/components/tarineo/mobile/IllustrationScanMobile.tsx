/** Illustration carte Scanner — téléphone + facture (esprit maquette APRÈS). */
export function IllustrationScanMobile({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="scanGlow" cx="70%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#EC5821" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EC5821" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="98" cy="62" r="52" fill="url(#scanGlow)" />

      {/* Facture derrière */}
      <g transform="translate(8 28) rotate(-8)">
        <rect width="58" height="78" rx="6" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
        <rect x="10" y="12" width="28" height="5" rx="2" fill="#EC5821" />
        <rect x="10" y="24" width="38" height="3.5" rx="1.5" fill="#e5e7eb" />
        <rect x="10" y="32" width="32" height="3.5" rx="1.5" fill="#e5e7eb" />
        <rect x="10" y="40" width="36" height="3.5" rx="1.5" fill="#e5e7eb" />
        <rect x="10" y="54" width="22" height="3.5" rx="1.5" fill="#d1d5db" />
        <text x="10" y="72" fill="#9ca3af" fontSize="7" fontFamily="system-ui,sans-serif" fontWeight="700">
          FACTURE
        </text>
      </g>

      {/* Téléphone */}
      <g transform="translate(48 18)">
        <rect width="72" height="118" rx="12" fill="#1a1f2a" />
        <rect x="4" y="4" width="64" height="110" rx="9" fill="#0f1c28" />
        <rect x="10" y="14" width="52" height="72" rx="4" fill="#fff" />
        <rect x="16" y="22" width="24" height="4" rx="2" fill="#EC5821" />
        <rect x="16" y="32" width="40" height="2.5" rx="1" fill="#e5e7eb" />
        <rect x="16" y="38" width="34" height="2.5" rx="1" fill="#e5e7eb" />
        <rect x="16" y="44" width="38" height="2.5" rx="1" fill="#e5e7eb" />
        <rect x="16" y="56" width="20" height="2.5" rx="1" fill="#d1d5db" />
        {/* Visor scan */}
        <rect x="14" y="48" width="44" height="2" rx="1" fill="#EC5821" opacity="0.9" />
        <path d="M18 20h8M18 20v8M48 20h-8M48 20v8M18 78h8M18 78v-8M48 78h-8M48 78v-8" stroke="#EC5821" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="102" r="5" stroke="#3a4555" strokeWidth="2" />
      </g>

      {/* Main stylisée */}
      <path
        d="M78 128c6 4 18 6 28 2 6-2 10-8 8-14-1-4-5-6-10-5l-8 2c-2-6-8-10-14-8-4 1-7 5-7 9v14z"
        fill="#f5c9a8"
      />
    </svg>
  );
}
