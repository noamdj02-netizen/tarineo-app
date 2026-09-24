/** Tokens Tailwind pour @react-email/tailwind (clients mail = valeurs en dur). */
export const navpitEmailTailwindConfig = {
  theme: {
    extend: {
      colors: {
        bg: "#f3f3f2",
        "bg-2": "#e8e7e5",
        surface: "#ffffff",
        ink: "#111111",
        "ink-2": "#555555",
        muted: "#8c8c8c",
        line: "#ececeb",
        accent: "#c4b5fd",
      },
      fontFamily: {
        sans: ['"Inter"', "Helvetica", "Arial", "sans-serif"],
        display: ['"Space Grotesk"', '"Inter"', "Helvetica", "sans-serif"],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },
      fontSize: {
        "11": ["11px", "16px"],
        "13": ["13px", "20px"],
        "14": ["14px", "22px"],
        "15": ["15px", "24px"],
        "20": ["20px", "26px"],
        "24": ["24px", "30px"],
        "32": ["32px", "36px"],
        "40": ["40px", "42px"],
        "48": ["48px", "50px"],
      },
      maxWidth: {
        copy: "490px",
      },
    },
  },
};
