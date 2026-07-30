/**
 * Widow control.
 *
 * `text-wrap: pretty` is applied site-wide in labs-theme.css and is the right
 * baseline, but it is explicitly best-effort: browsers still leave a short final word
 * alone on its own line, which is the case that looks worst in the narrow card grids
 * ("...people depend / on."). Measured on /about, six paragraphs still ended in a
 * one-word line with `pretty` active, so CSS alone does not solve this.
 *
 * The deterministic fix is typographic: bind the last two words with a non-breaking
 * space so they can only ever wrap together. Works in every browser, needs no layout
 * measurement, and costs nothing at runtime.
 *
 * Applied inside the shared presentational components (Card, LabsCard, PageHeader,
 * CtaBand, SectionLabel) rather than at each of the ~62 copy render sites, so new
 * pages inherit it for free.
 */
import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

/**
 * U+00A0. Built with fromCharCode rather than a literal so it cannot be silently
 * normalised back to an ordinary space by an editor or a tool, which is exactly what
 * happened on the first attempt and made the whole function a no-op.
 */
const NBSP = String.fromCharCode(0xa0)

/**
 * How many characters the bound tail should reach before we stop pulling words up.
 * Binding only the last two words is not enough when both are short: "...prove what
 * we find." still leaves "we find." alone on roughly 18% of the line. Accumulating to
 * a character target instead produces a last line with real weight.
 */
const MIN_TAIL_CHARS = 16

/** Never bind more than this many words, so a long tail cannot strand the line above. */
const MAX_BIND_WORDS = 4

/** Fewest words before binding is worthwhile; short labels are left alone. */
const MIN_WORDS = 4

/** Bind enough trailing words with non-breaking spaces to avoid a short last line. */
export function bindWidow(text: string): string {
  // Skip whitespace-only strings and anything already bound.
  if (!text.trim() || text.includes(NBSP)) return text

  // Preserve trailing whitespace so adjacent JSX fragments keep their spacing.
  const trailing = text.match(/\s+$/)?.[0] ?? ''
  const words = text.trim().split(/\s+/)
  if (words.length < MIN_WORDS) return text

  // Walk back from the end until the tail is long enough to hold a line on its own.
  let bind = 0
  let chars = 0
  while (bind < MAX_BIND_WORDS && bind < words.length - 1 && chars < MIN_TAIL_CHARS) {
    chars += words[words.length - 1 - bind].length + (bind > 0 ? 1 : 0)
    bind++
  }
  if (bind < 2) return text

  const head = words.slice(0, words.length - bind)
  const tail = words.slice(words.length - bind).join(NBSP)
  return (head.length ? head.join(' ') + ' ' : '') + tail + trailing
}

/**
 * Walk a React tree and bind widows in every string leaf. Elements are cloned only
 * where they have children to transform, and Children.map preserves keys.
 */
export function bindWidows(node: ReactNode): ReactNode {
  if (typeof node === 'string') return bindWidow(node)

  if (Array.isArray(node)) return Children.map(node, (child) => bindWidows(child))

  if (isValidElement<{ children?: ReactNode }>(node)) {
    const { children } = node.props
    if (children === undefined || children === null) return node
    return cloneElement(node, undefined, bindWidows(children))
  }

  return node
}
