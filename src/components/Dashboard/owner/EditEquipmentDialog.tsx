"use client"

import { useState } from "react"
import {
  ChevronDownIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateEquipmentAction } from "@/lib/action"
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  RENTAL_TYPES,
  type Equipment,
  type EquipmentCategory,
  type EquipmentCondition,
  type EquipmentUpdateInput,
  type RentalType,
} from "@/lib/fetch"

const selectClassName =
  "h-9 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 pr-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

const textareaClassName =
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

type FormState = {
  name: string
  description: string
  category: EquipmentCategory
  location: string
  price: string
  rentalType: RentalType
  availableQuantity: string
  condition: EquipmentCondition
  brand: string
  model: string
  image: string
  terms: string
  isAvailable: boolean
}

function toFormState(equipment: Equipment): FormState {
  return {
    name: equipment.name,
    description: equipment.description,
    category: equipment.category,
    location: equipment.location,
    price: String(equipment.price),
    rentalType: equipment.rentalType,
    availableQuantity: String(equipment.availableQuantity),
    condition: equipment.condition,
    brand: equipment.brand,
    model: equipment.model,
    image: equipment.image,
    terms: equipment.terms,
    isAvailable: equipment.isAvailable !== false,
  }
}

type EditEquipmentDialogProps = {
  equipment: Equipment
  onClose: () => void
  onSaved: (equipment: Equipment) => void
}

export function EditEquipmentDialog({
  equipment,
  onClose,
  onSaved,
}: EditEquipmentDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(equipment))
  const [saving, setSaving] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const description = form.description.trim()
    const location = form.location.trim()
    const brand = form.brand.trim()
    const model = form.model.trim()
    const image = form.image.trim()
    const terms = form.terms.trim()
    const price = Number(form.price)
    const availableQuantity = Number(form.availableQuantity)

    if (
      !name ||
      !description ||
      !location ||
      !brand ||
      !model ||
      !image ||
      !terms
    ) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Rental price must be greater than 0.")
      return
    }

    if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
      toast.error("Available quantity must be a whole number of 0 or more.")
      return
    }

    const payload: EquipmentUpdateInput = {
      name,
      description,
      category: form.category,
      location,
      price,
      rentalType: form.rentalType,
      availableQuantity,
      condition: form.condition,
      brand,
      model,
      image,
      terms,
      isAvailable: form.isAvailable,
    }

    setSaving(true)

    try {
      const result = await updateEquipmentAction(equipment._id, payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message ?? "Equipment updated successfully.")
      onSaved(result.data)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the equipment. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Update the listing details. Changes are saved to the database as
            soon as you submit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" htmlFor="edit-name" required>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                maxLength={120}
                required
              />
            </Field>

            <Field label="Category" htmlFor="edit-category" required>
              <Select
                id="edit-category"
                value={form.category}
                onChange={(value) =>
                  update("category", value as EquipmentCategory)
                }
              >
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Price" htmlFor="edit-price" required>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="edit-price"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => update("price", event.target.value)}
                  className="pl-6"
                  required
                />
              </div>
            </Field>

            <Field label="Rental type" htmlFor="edit-rental-type" required>
              <Select
                id="edit-rental-type"
                value={form.rentalType}
                onChange={(value) =>
                  update("rentalType", value as RentalType)
                }
              >
                {RENTAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Available quantity"
              htmlFor="edit-quantity"
              required
            >
              <Input
                id="edit-quantity"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.availableQuantity}
                onChange={(event) =>
                  update("availableQuantity", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Condition" htmlFor="edit-condition" required>
              <Select
                id="edit-condition"
                value={form.condition}
                onChange={(value) =>
                  update("condition", value as EquipmentCondition)
                }
              >
                {EQUIPMENT_CONDITIONS.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Location" htmlFor="edit-location" required>
              <Input
                id="edit-location"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                maxLength={120}
                required
              />
            </Field>

            <Field label="Brand" htmlFor="edit-brand" required>
              <Input
                id="edit-brand"
                value={form.brand}
                onChange={(event) => update("brand", event.target.value)}
                maxLength={80}
                required
              />
            </Field>

            <Field label="Model" htmlFor="edit-model" required>
              <Input
                id="edit-model"
                value={form.model}
                onChange={(event) => update("model", event.target.value)}
                maxLength={80}
                required
              />
            </Field>

            <Field label="Image URL" htmlFor="edit-image" required>
              {/* TODO(upload): add an "upload new image" button here that reuses
                  uploadEquipmentImageAction, the same way the add-equipment page does. */}
              <div className="flex items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                  {form.image.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image.trim()}
                      alt=""
                      className="size-full object-contain p-0.5"
                    />
                  ) : null}
                </div>
                <Input
                  id="edit-image"
                  type="url"
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                  placeholder="https://example.com/equipment.jpg"
                  required
                />
              </div>
            </Field>

            <Field
              label="Description"
              htmlFor="edit-description"
              required
              className="sm:col-span-2"
            >
              <textarea
                id="edit-description"
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
                minLength={20}
                maxLength={2000}
                required
                className={textareaClassName}
              />
            </Field>

            <Field
              label="Terms & conditions"
              htmlFor="edit-terms"
              required
              className="sm:col-span-2"
            >
              <textarea
                id="edit-terms"
                value={form.terms}
                onChange={(event) => update("terms", event.target.value)}
                minLength={10}
                maxLength={3000}
                required
                className={textareaClassName}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Available for rent</p>
              <p className="text-xs text-muted-foreground">
                Turn this off to hide the product from customers without
                deleting it.
              </p>
            </div>
            <Switch
              checked={form.isAvailable}
              onCheckedChange={(checked) =>
                update("isAvailable", checked === true)
              }
              aria-label="Available for rent"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 rounded-none bg-[#80bd50] px-5 font-semibold text-white hover:bg-[#6da640]"
            >
              {saving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  Save changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  htmlFor,
  required = false,
  className,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  )
}

function Select({
  id,
  value,
  onChange,
  children,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
