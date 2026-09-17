interface Props {
  title?: string;
  description?: string;
  wide?: boolean;
  extraWide?: boolean;
  children: React.ReactNode;
}

export function AppPageLayout({ title, description, wide, extraWide, children }: Props) {
  const width = extraWide ? "max-w-4xl" : wide ? "max-w-[1120px]" : "max-w-3xl";

  return (
    <div className={`mx-auto ${width} px-4 py-6 sm:px-6 sm:py-8 lg:px-8`}>
      {(title || description) && (
        <header className="mb-6">
          {title && <h1 className="app-display text-2xl font-semibold text-[var(--foreground)]">{title}</h1>}
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </header>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
