type JsonValue = Record<string, unknown>;

/** Injecte du JSON-LD (schema.org) — une ou plusieurs entités. */
export function JsonLd({ data }: { data: JsonValue | JsonValue[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
