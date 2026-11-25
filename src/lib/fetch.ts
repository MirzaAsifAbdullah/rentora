export const EQUIPMENT_CATEGORIES = [
  { value: "construction", label: "Construction & Heavy Equipment" },
  { value: "power-tools", label: "Power Tools" },
  { value: "garden-outdoor", label: "Garden & Outdoor" },
  { value: "photography-video", label: "Photography & Video" },
  { value: "audio-dj", label: "Audio & DJ" },
  { value: "event-party", label: "Event & Party" },
  { value: "cleaning", label: "Cleaning Equipment" },
  { value: "automotive", label: "Automotive & Transport" },
  { value: "camping", label: "Camping & Hiking" },
  { value: "sports-fitness", label: "Sports & Fitness" },
  { value: "other", label: "Other" },
] as const

export const RENTAL_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const

export const EQUIPMENT_CONDITIONS = [
  { value: "new", label: "Brand New" },
  { value: "like-new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]["value"]
export type RentalType = (typeof RENTAL_TYPES)[number]["value"]
export type EquipmentCondition =
  (typeof EQUIPMENT_CONDITIONS)[number]["value"]
export type EquipmentStatus = "pending" | "approved" | "rejected"

export type Equipment = {
  _id: string
  name: string
  description: string
  category: EquipmentCategory
  location: string
  price: number
  rentalType: RentalType
  availableQuantity: number
  condition: EquipmentCondition
  brand: string
  model: string
  image: string
  terms: string
  status: EquipmentStatus
  isAvailable: boolean
  ownerEmail: string
  ownerName?: string
  createdAt: string
}

/** The fields the form sends when creating equipment. */
export type EquipmentInput = {
  name: string
  description: string
  category: EquipmentCategory
  location: string
  price: number
  rentalType: RentalType
  availableQuantity: number
  condition: EquipmentCondition
  brand: string
  model: string
  image: string
  terms: string
}

/** The fields an owner may change from the "My Equipment" table. */
export type EquipmentUpdateInput = Partial<EquipmentInput> & {
  isAvailable?: boolean
}

/** Base URL of the Express server. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "")

/**
 * GET /all-equipments
 * Without an email it returns every equipment.
 * With an email it returns only that owner's equipment.
 */
export async function getEquipments(
  ownerEmail?: string
): Promise<Equipment[]> {
  const query = ownerEmail
    ? `?ownerEmail=${encodeURIComponent(ownerEmail)}`
    : ""

  const response = await fetch(`${API_BASE_URL}/all-equipments${query}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to get equipments.")
  }

  const equipments = (await response.json()) as Equipment[]

  return equipments.map((equipment) => ({
    ...equipment,
    isAvailable: equipment.isAvailable !== false,
  }))
}
