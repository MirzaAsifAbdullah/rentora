"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDownIcon,
  ImagePlusIcon,
  Loader2Icon,
  PackagePlusIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createEquipmentAction,
  uploadEquipmentImageAction,
} from "@/lib/action"
import { useSession } from "@/lib/auth-client"
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  RENTAL_TYPES,
  type EquipmentCategory,
  type EquipmentCondition,
  type EquipmentInput,
  type RentalType,
} from "@/lib/fetch"

const selectClassName =
  "h-9 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 pr-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

const textareaClassName =
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

export default function AddEquipmentPage() {
  const { data: session, isPending } = useSession()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const objectUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ownerEmail = session?.user?.email ?? ""
  const isOwner = session?.user?.role === "owner"
  const previewSrc = preview ?? (imageUrl.trim() ? imageUrl.trim() : null)

  function clearImageState() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    setImageFile(null)
    setImageUrl("")
    setPreview(null)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    if (!file) {
      setImageFile(null)
      setPreview(null)
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.")
      event.target.value = ""
      setImageFile(null)
      setPreview(null)
      return
    }

    if (file.size > 7 * 1024 * 1024) {
      toast.error("Image is too large. Please choose a file under 7 MB.")
      event.target.value = ""
      setImageFile(null)
      setPreview(null)
      return
    }

    objectUrlRef.current = URL.createObjectURL(file)
    setImageFile(file)
    setPreview(objectUrlRef.current)
    setImageUrl("")
  }

  function handleImageUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    if (value.trim() && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
      setImageFile(null)
      setPreview(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    setImageUrl(value)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const name = String(formData.get("name") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const category = String(formData.get("category") ?? "") as EquipmentCategory
    const location = String(formData.get("location") ?? "").trim()
    const rentalType = String(formData.get("rentalType") ?? "") as RentalType
    const condition = String(formData.get("condition") ?? "") as EquipmentCondition
    const brand = String(formData.get("brand") ?? "").trim()
    const model = String(formData.get("model") ?? "").trim()
    const terms = String(formData.get("terms") ?? "").trim()

    const price = Number(formData.get("price"))
    const availableQuantity = Number(formData.get("availableQuantity"))

    if (!name || !description || !location || !brand || !model || !terms) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (!category || !rentalType || !condition) {
      toast.error("Please choose a category, rental type and condition.")
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

    if (!imageFile && !imageUrl.trim()) {
      toast.error("Please upload an equipment image or paste an image URL.")
      return
    }

    setSubmitting(true)

    try {
      let image = imageUrl.trim()

      if (imageFile) {
        const uploadData = new FormData()
        uploadData.append("file", imageFile)

        const upload = await uploadEquipmentImageAction(uploadData)

        if (!upload.success) {
          toast.error(upload.message)
          return
        }

        image = upload.data
      }

      const payload: EquipmentInput = {
        name,
        description,
        category,
        location,
        price,
        rentalType,
        availableQuantity,
        condition,
        brand,
        model,
        image,
        terms,
      }

      const result = await createEquipmentAction(payload)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(
        result.message ?? "Equipment added successfully and sent for review."
      )

      form.reset()
      clearImageState()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not add the equipment. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!isPending && !session) {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Add Equipment
          </h1>
          <p className="text-sm text-muted-foreground">
            List new equipment for customers to rent.
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-10 text-center">
          <ShieldCheckIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You need to sign in with an owner account to add equipment.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-none bg-[#80bd50] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#6da640]"
          >
            Go to sign in
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Add Equipment</h1>
        <p className="text-sm text-muted-foreground">
          List new equipment for customers to rent. Every new listing is
          reviewed by an admin before it appears publicly.
        </p>
      </header>

      {!isPending && session && !isOwner ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Your account role is{" "}
          <span className="font-semibold">{session.user.role}</span>. Only owner
          accounts can create equipment listings.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {/* Basic details */}
          <div className="space-y-5 p-5 sm:p-6">
            <SectionTitle
              title="Basic details"
              description="Tell renters what the equipment is and where it is located."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Equipment Name" htmlFor="name" required>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Bosch GBH 2-26 Rotary Hammer"
                  maxLength={120}
                  required
                />
              </Field>

              <Field label="Category" htmlFor="category" required>
                <Select id="category" name="category" required>
                  <option value="" disabled>
                    Select a category
                  </option>
                  {EQUIPMENT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Description"
                htmlFor="description"
                required
                hint="Include what is in the box, its use case and any accessories."
                className="md:col-span-2"
              >
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the equipment, what it is best used for and anything included with the rental."
                  minLength={20}
                  maxLength={2000}
                  required
                  className={textareaClassName}
                />
              </Field>

              <Field label="Location" htmlFor="location" required>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Dhaka, Mirpur"
                  maxLength={120}
                  required
                />
              </Field>

              <Field label="Brand" htmlFor="brand" required>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="e.g. Bosch"
                  maxLength={80}
                  required
                />
              </Field>

              <Field label="Model" htmlFor="model" required>
                <Input
                  id="model"
                  name="model"
                  placeholder="e.g. GBH 2-26"
                  maxLength={80}
                  required
                />
              </Field>

              <Field label="Equipment Condition" htmlFor="condition" required>
                <Select
                  id="condition"
                  name="condition"
                  required
                  defaultValue="good"
                >
                  {EQUIPMENT_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          {/* Pricing & availability */}
          <div className="space-y-5 border-t p-5 sm:p-6">
            <SectionTitle
              title="Pricing & availability"
              description="The booking total is recalculated on the server from this price, the rental type and the quantity."
            />

            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Rental Price" htmlFor="price" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-6"
                    required
                  />
                </div>
              </Field>

              <Field label="Rental Type" htmlFor="rentalType" required>
                <Select
                  id="rentalType"
                  name="rentalType"
                  required
                  defaultValue="daily"
                >
                  {RENTAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Available Quantity"
                htmlFor="availableQuantity"
                required
              >
                <Input
                  id="availableQuantity"
                  name="availableQuantity"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="1"
                  defaultValue="1"
                  required
                />
              </Field>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-5 border-t p-5 sm:p-6">
            <SectionTitle
              title="Equipment image"
              description="Upload a photo (stored with ImgBB) or paste a direct image URL."
            />

            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-dashed bg-muted/30">
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt="Equipment preview"
                    fill
                    unoptimized
                    sizes="180px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
                    <ImagePlusIcon className="size-7" />
                    <span className="text-xs">Image preview</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Field label="Upload image" htmlFor="imageFile">
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="h-auto py-1.5 file:mr-3 file:rounded-md file:bg-muted file:px-2 file:py-1 file:text-xs"
                  />
                </Field>

                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP or GIF, up to 7 MB.
                </p>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
                      or use a URL
                    </span>
                  </div>
                </div>

                <Field label="Direct image URL" htmlFor="imageUrl">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/equipment.jpg"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-5 border-t p-5 sm:p-6">
            <SectionTitle
              title="Rental terms and conditions"
              description="Set expectations for deposits, late returns, damage and usage."
            />

            <Field label="Terms and conditions" htmlFor="terms" required>
              <textarea
                id="terms"
                name="terms"
                placeholder="e.g. A refundable deposit is required. The renter is responsible for any damage during the rental period."
                minLength={10}
                maxLength={3000}
                required
                className={`${textareaClassName} min-h-32`}
              />
            </Field>
          </div>

          {/* Ownership & status */}
          <div className="space-y-5 border-t p-5 sm:p-6">
            <SectionTitle
              title="Ownership & status"
              description="Equipment is linked to your account so only you can see and manage your own listings."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Owner Email"
                htmlFor="ownerEmail"
                hint="Taken from your signed-in account and verified on the server."
              >
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  value={isPending ? "Loading your account…" : ownerEmail}
                  readOnly
                  disabled
                  placeholder="owner@example.com"
                />
              </Field>

              <Field
                label="Status"
                htmlFor="status"
                hint="An admin must approve this listing before it goes live."
              >
                <Input
                  id="status"
                  name="status"
                  value="Pending"
                  readOnly
                  disabled
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
         
<Button
  nativeButton={true}
  type="reset"
  variant="outline"
  disabled={submitting}
  onClick={clearImageState}
  className="h-10 px-5 sm:w-auto"
>
  Clear form
</Button>

<Button
  nativeButton={true}
  type="submit"
  disabled={submitting || isPending || !session}
  className="h-10 gap-2 rounded-none bg-[#80bd50] px-6 font-semibold text-white hover:bg-[#6da640]"
>
  {submitting ? (
    <>
      <Loader2Icon className="size-4 animate-spin" />
      Adding equipment…
    </>
  ) : (
    <>
      <PackagePlusIcon className="size-4" />
      Add Equipment
    </>
  )}
</Button>

        </div>
      </form>
    </section>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  required = false,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Select({
  id,
  name,
  required = false,
  defaultValue,
  children,
}: {
  id: string
  name: string
  required?: boolean
  defaultValue?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={selectClassName}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
