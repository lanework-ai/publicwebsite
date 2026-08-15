/**
 * Renders one or more JSON-LD nodes as a single script tag. Nulls are dropped so
 * callers can pass an optional node (faqSchema returns null when a document has
 * no FAQs) without branching at the call site.
 */
export default function JsonLd({ schema }: { schema: unknown | unknown[] }) {
  const nodes = (Array.isArray(schema) ? schema : [schema]).filter(Boolean)
  if (nodes.length === 0) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(nodes.length === 1 ? nodes[0] : nodes),
      }}
    />
  )
}
