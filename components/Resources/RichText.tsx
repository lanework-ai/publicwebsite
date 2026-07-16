import { PortableText, type PortableTextComponents } from '@portabletext/react'

/**
 * PortableText renderer with explicit, dependency-free spacing.
 *
 * We do NOT rely on the `prose` (@tailwindcss/typography) classes here because
 * the typography plugin is not registered in tailwind.config.ts, so `prose`
 * is a no-op and paragraphs collapse together. These components set their own
 * margins so block content (e.g. white paper / benchmark methodology) renders
 * with proper paragraph spacing regardless of the Tailwind plugin setup.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-5 last:mb-0">{children}</p>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-white mt-8 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent-cyan/50 pl-4 italic text-gray-300 my-5">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 space-y-2 text-gray-300 mb-5">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-2 text-gray-300 mb-5">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-cyan hover:underline"
      >
        {children}
      </a>
    ),
  },
}

export default function RichText({ value }: { value: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components} />
}
