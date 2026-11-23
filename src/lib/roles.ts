export const USER_ROLES = ["customer", "owner", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

export const DEFAULT_ROLE: UserRole = "customer"

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  )
}

export function getDashboardPath(role: unknown): string {
  return `/dashboard/${isUserRole(role) ? role : DEFAULT_ROLE}`
}

export function getProfilePath(role: unknown): string {
  return `${getDashboardPath(role)}/profile`
}
