import type { EquipmentCategory, EquipmentStatus } from "@/lib/fetch"

/**
 * Compact labels used by dashboard tables, where the long labels from
 * EQUIPMENT_CATEGORIES do not fit inside a pill.
 */
export const EQUIPMENT_CATEGORY_SHORT_LABELS: Record<
  EquipmentCategory,
  string
> = {
  construction: "Construction",
  "power-tools": "Power Tools",
  "garden-outdoor": "Garden",
  "photography-video": "Photo & Video",
  "audio-dj": "Audio & DJ",
  "event-party": "Event & Party",
  cleaning: "Cleaning",
  automotive: "Automotive",
  camping: "Camping",
  "sports-fitness": "Sports",
  other: "Other",
}

/** Pastel pill styles per category, similar to the reference dashboard. */
export const EQUIPMENT_CATEGORY_TONES: Record<EquipmentCategory, string> = {
  construction:
    "bg-blue-100 text-blue-700 hover:bg-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25",
  "power-tools":
    "bg-violet-100 text-violet-700 hover:bg-violet-200/80 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25",
  "garden-outdoor":
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25",
  "photography-video":
    "bg-sky-100 text-sky-700 hover:bg-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25",
  "audio-dj":
    "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200/80 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/25",
  "event-party":
    "bg-pink-100 text-pink-700 hover:bg-pink-200/80 dark:bg-pink-500/15 dark:text-pink-300 dark:hover:bg-pink-500/25",
  cleaning:
    "bg-cyan-100 text-cyan-700 hover:bg-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/25",
  automotive:
    "bg-amber-100 text-amber-700 hover:bg-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
  camping:
    "bg-lime-100 text-lime-700 hover:bg-lime-200/80 dark:bg-lime-500/15 dark:text-lime-300 dark:hover:bg-lime-500/25",
  "sports-fitness":
    "bg-orange-100 text-orange-700 hover:bg-orange-200/80 dark:bg-orange-500/15 dark:text-orange-300 dark:hover:bg-orange-500/25",
  other:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 dark:bg-zinc-500/15 dark:text-zinc-300 dark:hover:bg-zinc-500/25",
}

/**
 * Small approval-status hint shown under the equipment name.
 * Owners can only read this status: moving a listing between pending,
 * approved and rejected is an admin action.
 * TODO(admin): wire the admin approval controls when the admin dashboard lands.
 */
export const EQUIPMENT_STATUS_HINTS: Record<
  EquipmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending admin approval",
    className: "text-amber-600 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    className: "text-emerald-600 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected by admin",
    className: "text-destructive",
  },
}
