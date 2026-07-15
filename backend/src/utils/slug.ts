/** Turn a restaurant name into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'restaurant';
}

/** Ensure uniqueness by appending -2, -3, … when needed. */
export async function uniqueTenantSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let candidate = slugify(base);
  if (!(await exists(candidate))) return candidate;
  for (let i = 2; i < 1000; i++) {
    const next = `${candidate}-${i}`.slice(0, 100);
    if (!(await exists(next))) return next;
  }
  return `${candidate}-${Date.now()}`.slice(0, 100);
}
