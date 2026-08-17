export function isAdminUser(user: { collection?: string } | null | undefined): boolean {
  return user?.collection === 'users'
}

export function isViewerUser(user: { collection?: string } | null | undefined): boolean {
  return user?.collection === 'viewers'
}

export function getAssignedProjectIds(user: unknown): string[] {
  if (!user || typeof user !== 'object' || !('projects' in user)) return []

  const projects = (user as { projects?: unknown }).projects
  if (!Array.isArray(projects)) return []

  return projects
    .map((project) => {
      if (typeof project === 'string' || typeof project === 'number') return String(project)
      if (project && typeof project === 'object' && 'id' in project) {
        return String((project as { id: string | number }).id)
      }
      return null
    })
    .filter((id): id is string => Boolean(id))
}

export function getSessionId(user: unknown): string | undefined {
  if (!user || typeof user !== 'object' || !('_sid' in user)) return undefined
  const sid = (user as { _sid?: unknown })._sid
  return typeof sid === 'string' ? sid : undefined
}
