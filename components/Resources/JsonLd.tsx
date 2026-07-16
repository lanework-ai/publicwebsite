/**
 * Server component that emits a single Schema.org JSON-LD <script>.
 * Accepts either a single object or an array of objects (multiple types per page).
 */
export default function JsonLd({ data }: { data: Record<string, any> | Record<string, any>[] }) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
