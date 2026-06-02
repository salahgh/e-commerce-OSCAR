/**
 * Renders one or more schema.org JSON-LD blocks as <script> tags.
 * The data is built from trusted application sources.
 */
type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Escape "<" to defend against </script> breakouts in any string field.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}

export default JsonLd;
