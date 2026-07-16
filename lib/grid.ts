/**
 * Returns the grid classes for a row of ContentCards, centering the row when
 * there are fewer than 3 cards so a single card doesn't sit lonely on the left.
 */
export function cardGridClass(count: number): string {
  if (count <= 1) return 'grid gap-6 lg:gap-8 grid-cols-1 max-w-md mx-auto'
  if (count === 2) return 'grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
  return 'grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}
