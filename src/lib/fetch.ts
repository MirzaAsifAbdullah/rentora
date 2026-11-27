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

/** Number of cards shown per page on the public equipment listing. */
export const EQUIPMENT_PAGE_SIZE = 9

export const EQUIPMENT_SORT_OPTIONS = [
  { value: "newest", label: "Recently Added" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const

export type EquipmentSort = (typeof EQUIPMENT_SORT_OPTIONS)[number]["value"]

/**
 * The URL-backed state of the public equipment listing. Every value is kept
 * as a string so the exact same shape can be parsed from `searchParams` and
 * serialised back into a query string.
 */
export type EquipmentFilters = {
  search: string
  categories: EquipmentCategory[]
  location: string
  rentalTypes: RentalType[]
  minPrice: string
  maxPrice: string
  availableOnly: boolean
  sort: EquipmentSort
  page: number
}

/** Paginated payload returned by `GET /all-equipments?paginate=true`. */
export type EquipmentListResponse = {
  items: Equipment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const CATEGORY_VALUES = new Set<string>(
  EQUIPMENT_CATEGORIES.map((category) => category.value)
)
const RENTAL_TYPE_VALUES = new Set<string>(
  RENTAL_TYPES.map((rentalType) => rentalType.value)
)
const SORT_VALUES = new Set<string>(
  EQUIPMENT_SORT_OPTIONS.map((option) => option.value)
)

/**
 * Category values written by older versions of the owner form. They are kept
 * in the database, so the UI normalises them instead of showing an unknown
 * category or excluding those listings from a filter.
 */
export const LEGACY_CATEGORY_ALIASES: Record<string, EquipmentCategory> = {
  electronics: "other",
  "tools-equipment": "power-tools",
  "outdoor-equipment": "camping",
  photography: "photography-video",
  "construction-equipment": "construction",
  garden: "garden-outdoor",
  audio: "audio-dj",
  event: "event-party",
  "cleaning-equipment": "cleaning",
  "automotive-transport": "automotive",
  sports: "sports-fitness",
}

/** Legacy categories grouped by the canonical category they belong to. */
const CATEGORY_QUERY_ALIASES = Object.entries(LEGACY_CATEGORY_ALIASES).reduce<
  Record<string, string[]>
>((aliases, [legacy, canonical]) => {
  aliases[canonical] = [...(aliases[canonical] ?? []), legacy]

  return aliases
}, {})

function readString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

/** Accepts `category=a,b` as well as repeated `category=a&category=b`. */
function readList(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value : [value]

  return raw
    .flatMap((entry) => (entry ? entry.split(",") : []))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isEquipmentCategory(value: string): value is EquipmentCategory {
  return CATEGORY_VALUES.has(value)
}

/**
 * Resolves a stored category (including legacy spellings) to a canonical
 * category. Returns `null` for values that are not recognised at all.
 */
export function normalizeEquipmentCategory(
  value: string
): EquipmentCategory | null {
  if (isEquipmentCategory(value)) {
    return value
  }

  return LEGACY_CATEGORY_ALIASES[value] ?? null
}

function isRentalType(value: string): value is RentalType {
  return RENTAL_TYPE_VALUES.has(value)
}

function isEquipmentSort(value: string): value is EquipmentSort {
  return SORT_VALUES.has(value)
}

/** Normalises the raw `searchParams` object into the listing filter shape. */
export function parseEquipmentFilters(
  params: Record<string, string | string[] | undefined>
): EquipmentFilters {
  const sort = readString(params.sort)
  const page = Number.parseInt(readString(params.page), 10)
  const categories = readList(params.category)
    .map(normalizeEquipmentCategory)
    .filter((category): category is EquipmentCategory => category !== null)

  return {
    search: readString(params.search).trim(),
    categories: Array.from(new Set(categories)),
    location: readString(params.location).trim(),
    rentalTypes: readList(params.rentalType).filter(isRentalType),
    minPrice: readString(params.minPrice).trim(),
    maxPrice: readString(params.maxPrice).trim(),
    availableOnly:
      readString(params.available) === "1" ||
      readString(params.available) === "true",
    sort: isEquipmentSort(sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/**
 * Serialises the filters into the query string used by both the public page
 * URL and the Express `/all-equipments` request.
 */
export function buildEquipmentSearchParams(filters: EquipmentFilters) {
  const params = new URLSearchParams()

  if (filters.search) {
    params.set("search", filters.search)
  }

  if (filters.categories.length > 0) {
    params.set("category", filters.categories.join(","))
  }

  if (filters.location) {
    params.set("location", filters.location)
  }

  if (filters.rentalTypes.length > 0) {
    params.set("rentalType", filters.rentalTypes.join(","))
  }

  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice)
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice)
  }

  if (filters.availableOnly) {
    params.set("available", "1")
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort)
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page))
  }

  return params
}

/**
 * Same query string as `buildEquipmentSearchParams`, but expands a canonical
 * category into the legacy values stored by older listings so the filter does
 * not silently hide them.
 */
export function buildEquipmentApiSearchParams(filters: EquipmentFilters) {
  const params = buildEquipmentSearchParams(filters)

  if (filters.categories.length > 0) {
    params.set(
      "category",
      filters.categories
        .flatMap((category) => [
          category,
          ...(CATEGORY_QUERY_ALIASES[category] ?? []),
        ])
        .join(",")
    )
  }

  return params
}

/** Number of filters currently narrowing the listing. */
export function countActiveFilters(filters: EquipmentFilters) {
  return (
    (filters.search ? 1 : 0) +
    filters.categories.length +
    (filters.location ? 1 : 0) +
    filters.rentalTypes.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  )
}

/**
 * GET /all-equipments
 * Without an email it returns approved equipment (public marketplace).
 * With an email it returns every listing owned by that owner.
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

/**
 * GET /all-equipments?paginate=true — server-side search, filters, sorting and
 * pagination. The Express API owns the query so the browser never downloads
 * the whole collection just to filter it.
 */
export async function getEquipmentList(
  filters: EquipmentFilters
): Promise<EquipmentListResponse> {
  const params = buildEquipmentApiSearchParams(filters)
  params.set("paginate", "true")
  params.set("limit", String(EQUIPMENT_PAGE_SIZE))

  const response = await fetch(
    `${API_BASE_URL}/all-equipments?${params.toString()}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    throw new Error("Failed to load equipment.")
  }

  const data = (await response.json()) as
    | EquipmentListResponse
    | Equipment[]

  // Keep the page usable if an older backend (which returns an array) is
  // still running while the new query support is being deployed.
  if (Array.isArray(data)) {
    const items = data.map((equipment) => ({
      ...equipment,
      isAvailable: equipment.isAvailable !== false,
    }))

    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    }
  }

  return {
    items: (data.items ?? []).map((equipment) => ({
      ...equipment,
      isAvailable: equipment.isAvailable !== false,
    })),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? EQUIPMENT_PAGE_SIZE,
    totalPages: data.totalPages ?? 1,
  }
}

/** GET /all-equipments/:id — used by the equipment details page. */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const response = await fetch(
    `${API_BASE_URL}/all-equipments/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to load the equipment.")
  }

  const equipment = (await response.json()) as Equipment

  return {
    ...equipment,
    isAvailable: equipment.isAvailable !== false,
  }
}

/** Units free for one equipment item on a specific date range. */
export type EquipmentAvailability = {
  equipmentId: string
  totalQuantity: number
  reservedQuantity: number
  availableQuantity: number
  startDate: string
  endDate: string
}

/**
 * GET /all-equipments/:id/availability
 * Availability is based on overlapping paid rentals for the chosen dates, not
 * on who the customer is, so repeat rentals are allowed when stock is free.
 */
export async function getEquipmentAvailability(
  id: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal
): Promise<EquipmentAvailability> {
  const params = new URLSearchParams({ startDate, endDate })

  const response = await fetch(
    `${API_BASE_URL}/all-equipments/${encodeURIComponent(id)}/availability?${params.toString()}`,
    { cache: "no-store", signal }
  )

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { message?: string }
      | null

    throw new Error(data?.message ?? "Failed to check availability.")
  }

  return (await response.json()) as EquipmentAvailability
}
