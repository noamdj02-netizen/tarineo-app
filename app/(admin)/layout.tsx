export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-[calc(28px+env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
