import { Manrope } from "next/font/google";
import { AuthSessionProvider } from "./_components/AuthSessionProvider";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <div className={`${manrope.className} min-h-dvh antialiased`}>{children}</div>
    </AuthSessionProvider>
  );
}
