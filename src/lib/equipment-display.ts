import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  normalizeEquipmentCategory,
} from "@/lib/fetch"
import {
  EQUIPMENT_CATEGORY_SHORT_LABELS,
  EQUIPMENT_CATEGORY_TONES,
} from "@/lib/equipment-meta"

function prettify(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

/** Label for a category value, including legacy values already in MongoDB. */
export function getCategoryLabel(value: string) {
  const category = normalizeEquipmentCategory(value)

  return (
    EQUIPMENT_CATEGORIES.find((entry) => entry.value === category)?.label ??
    prettify(value)
  )
}

export function getCategoryShortLabel(value: string) {
  const category = normalizeEquipmentCategory(value)

  return category
    ? EQUIPMENT_CATEGORY_SHORT_LABELS[category]
    : prettify(value)
}

export function getCategoryTone(value: string) {
  const category = normalizeEquipmentCategory(value)

  return category
    ? EQUIPMENT_CATEGORY_TONES[category]
    : EQUIPMENT_CATEGORY_TONES.other
}

export function getConditionLabel(value: string) {
  return (
    EQUIPMENT_CONDITIONS.find((condition) => condition.value === value)
      ?.label ?? prettify(value)
  )
}

export function getRentalUnit(value: string) {
  if (value === "weekly") {
    return "week"
  }

  if (value === "monthly") {
    return "month"
  }

  return "day"
}

export function formatPrice(value: number | string) {
  const price = Number(value)

  if (!Number.isFinite(price)) {
    return "$0"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price)
}
