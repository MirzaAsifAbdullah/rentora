"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import {
  API_BASE_URL,
  type Equipment,
  type EquipmentInput,
  type EquipmentUpdateInput,
} from "@/lib/fetch"

export type ActionResult<T = null> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string }

const MAX_IMAGE_SIZE = 7 * 1024 * 1024

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "fetch failed") {
    return `Could not reach the backend at ${API_BASE_URL}. Please make sure the server is running.`
  }

  return error instanceof Error ? error.message : "Something went wrong."
}

/**
 * Reads the signed-in user from Better Auth.
 * The email is taken from the session, so the browser cannot fake it.
 */
async function getOwner() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.email) {
    throw new Error("Please sign in with an owner account.")
  }

  if (session.user.role !== "owner") {
    throw new Error("Only owner accounts can manage equipment.")
  }

  return {
    email: session.user.email,
    name: session.user.name ?? "",
  }
}

/** POST /all-equipments — add a new equipment for the signed-in owner. */
export async function createEquipmentAction(
  input: EquipmentInput
): Promise<ActionResult<Equipment>> {
  try {
    const owner = await getOwner()

    const response = await fetch(`${API_BASE_URL}/all-equipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        ownerEmail: owner.email,
        ownerName: owner.name,
      }),
      cache: "no-store",
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to add equipment.",
      }
    }

    return {
      success: true,
      data: data as Equipment,
      message: "Equipment added successfully and sent for review.",
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}

/** GET /all-equipments?ownerEmail=… — load the signed-in owner's listings. */
export async function getMyEquipmentsAction(): Promise<
  ActionResult<Equipment[]>
> {
  try {
    const owner = await getOwner()

    const response = await fetch(
      `${API_BASE_URL}/all-equipments?ownerEmail=${encodeURIComponent(owner.email)}`,
      { cache: "no-store" }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to load your equipment.",
      }
    }

    // Documents created before the availability toggle existed are available.
    const equipments = (data as Equipment[]).map((equipment) => ({
      ...equipment,
      isAvailable: equipment.isAvailable !== false,
    }))

    return { success: true, data: equipments }
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

const EQUIPMENT_UPDATE_FIELDS: (keyof EquipmentUpdateInput)[] = [
  "name",
  "description",
  "category",
  "location",
  "price",
  "rentalType",
  "availableQuantity",
  "condition",
  "brand",
  "model",
  "image",
  "terms",
  "isAvailable",
]

/** PATCH /all-equipments/:id — update one of the signed-in owner's listings. */
export async function updateEquipmentAction(
  id: string,
  input: EquipmentUpdateInput
): Promise<ActionResult<Equipment>> {
  try {
    if (!id) {
      return { success: false, message: "Missing equipment id." }
    }

    const owner = await getOwner()

    // Only whitelisted fields are forwarded. The owner email comes from the
    // session and `status` is intentionally not editable by owners.
    const changes: Record<string, unknown> = {}

    for (const field of EQUIPMENT_UPDATE_FIELDS) {
      if (input[field] !== undefined) {
        changes[field] = input[field]
      }
    }

    if (Object.keys(changes).length === 0) {
      return { success: false, message: "There is nothing to update." }
    }

    const response = await fetch(
      `${API_BASE_URL}/all-equipments/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...changes, ownerEmail: owner.email }),
        cache: "no-store",
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to update the equipment.",
      }
    }

    return {
      success: true,
      data: {
        ...(data as Equipment),
        isAvailable: (data as Equipment).isAvailable !== false,
      },
      message: "Equipment updated successfully.",
    }
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

/** DELETE /all-equipments/:id — remove one of the signed-in owner's listings. */
export async function deleteEquipmentAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    if (!id) {
      return { success: false, message: "Missing equipment id." }
    }

    const owner = await getOwner()

    const response = await fetch(
      `${API_BASE_URL}/all-equipments/${encodeURIComponent(id)}?ownerEmail=${encodeURIComponent(owner.email)}`,
      { method: "DELETE", cache: "no-store" }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to delete the equipment.",
      }
    }

    return {
      success: true,
      data: null,
      message: data?.message ?? "Equipment deleted successfully.",
    }
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

/** POST /upload-image — send the image to ImgBB and return its URL. */
export async function uploadEquipmentImageAction(
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    await getOwner()

    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: "Please choose an image file." }
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "Please choose a valid image file." }
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        message: "Image is too large. Please choose a file under 7 MB.",
      }
    }

    const image = Buffer.from(await file.arrayBuffer()).toString("base64")

    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
      cache: "no-store",
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.url) {
      return {
        success: false,
        message: data?.message ?? "Image upload failed.",
      }
    }

    return { success: true, data: data.url as string }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    }
  }
}
