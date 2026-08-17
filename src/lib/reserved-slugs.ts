export const RESERVED_PROJECT_SLUGS = new Set([
  'admin',
  'api',
  'graphql',
  'graphql-playground',
  'login',
  'next',
  '_next',
])

export function isReservedProjectSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return RESERVED_PROJECT_SLUGS.has(slug.toLowerCase())
}
