import type { ReactElement } from "react";

import type { IconName } from "@/lib/site/landing-v2-content";

const paths: Record<IconName, ReactElement> = {
  mail: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
      <path d="M3 6l7 5 7-5" />
    </>
  ),
  spark: (
    <>
      <path d="M10 2.5l1.8 4.7 4.7 1.8-4.7 1.8L10 15.5l-1.8-4.7L3.5 9l4.7-1.8z" />
    </>
  ),
  site: (
    <>
      <path d="M3 16.5h14" />
      <path d="M5 16.5V9.5l5-4 5 4v7" />
      <path d="M8.5 16.5v-4h3v4" />
    </>
  ),
  doc: (
    <>
      <path d="M5.5 2.5h5.5l4 4v11h-9.5z" />
      <path d="M11 2.5v4h4" />
      <path d="M8 11h4.5M8 13.5h4.5" />
    </>
  ),
  invoice: (
    <>
      <path d="M5.5 2.5h9v15l-3-1.6-3 1.6-3-1.6z" />
      <path d="M8 7h4M8 10h4" />
    </>
  ),
  check: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.8 10.2l2.2 2.2 4.2-4.4" />
    </>
  ),
  box: (
    <>
      <path d="M10 2.6l6.5 3.4v8L10 17.4 3.5 14V6z" />
      <path d="M3.5 6L10 9.4 16.5 6M10 9.4v8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
      <path d="M3 8.5h14M7 3v3M13 3v3" />
    </>
  ),
  loupe: (
    <>
      <circle cx="8.8" cy="8.8" r="5.3" />
      <path d="M12.8 12.8l4.2 4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M10 3a4.5 4.5 0 00-4.5 4.5V11L4 13.5h12L14.5 11V7.5A4.5 4.5 0 0010 3z" />
      <path d="M8.2 15.5a1.9 1.9 0 003.6 0" />
    </>
  ),
  shield: (
    <>
      <path d="M10 2.6l6 2.2v5c0 3.6-2.4 6.6-6 7.6-3.6-1-6-4-6-7.6v-5z" />
      <path d="M7.6 9.9l1.8 1.8 3.2-3.4" />
    </>
  ),
  link: (
    <>
      <path d="M8.4 11.6a3.2 3.2 0 010-4.5l2.3-2.3a3.2 3.2 0 014.5 4.5l-1 1" />
      <path d="M11.6 8.4a3.2 3.2 0 010 4.5l-2.3 2.3a3.2 3.2 0 01-4.5-4.5l1-1" />
    </>
  ),
  history: (
    <>
      <path d="M3.2 10a6.8 6.8 0 111.9 4.7" />
      <path d="M3 5.6V10h4.2" />
      <path d="M10 6.6V10l2.6 1.6" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 1.5,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}