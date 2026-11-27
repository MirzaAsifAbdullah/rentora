"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MapPin, Phone, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import {
  API_BASE_URL,
  getEquipmentAvailability,
  type EquipmentAvailability,
} from "@/lib/fetch"
import { formatPrice, getRentalUnit } from "@/lib/equipment-display"

type RentalFormProps = {
  equipmentId: string
  equipmentName: string
  price: number
  rentalType: string
  availableQuantity: number
}

export function RentalForm({
  equipmentId,
  equipmentName,
  price,
  rentalType,
  availableQuantity,
}: RentalFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Availability for the selected dates. `null` means it has not been
  // checked yet, so the form falls back to the equipment's total stock.
  const [dateAvailability, setDateAvailability] =
    useState<EquipmentAvailability | null>(null)
  const [availabilityError, setAvailabilityError] = useState<{
    key: string
    message: string
  } | null>(null)

  const rentalUnit = getRentalUnit(rentalType)

  // Calculate rental duration
  let duration = 0

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const difference =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    if (difference > 0) {
      duration = Math.ceil(difference)
    }
  }

  const hasValidDates = duration > 0

  // Calculate rental units
  let rentalUnits = duration

  if (rentalType.toLowerCase().includes("week")) {
    rentalUnits = Math.ceil(duration / 7)
  } else if (rentalType.toLowerCase().includes("month")) {
    rentalUnits = Math.ceil(duration / 30)
  }

  // Only use a result that belongs to the dates currently in the inputs.
  const availabilityKey = `${startDate}:${endDate}`
  const availabilityMatchesDates =
    dateAvailability?.startDate === startDate &&
    dateAvailability?.endDate === endDate
  const availabilityErrorForDates =
    availabilityError?.key === availabilityKey
      ? availabilityError.message
      : null

  const maxQuantity = availabilityMatchesDates
    ? dateAvailability.availableQuantity
    : availableQuantity
  const canRent = maxQuantity > 0

  // Keep the value the user sees (and pays for) inside the free quantity,
  // without an extra state update effect.
  const quantityLimit = Math.max(1, maxQuantity)
  const effectiveQuantity = Math.max(1, Math.min(quantity, quantityLimit))

  const totalPrice = price * rentalUnits * effectiveQuantity

  // A request is in flight when the dates are valid, no result for those dates
  // exists yet, and the last request did not fail.
  const checkingAvailability =
    hasValidDates && !availabilityMatchesDates && !availabilityErrorForDates

  // Ask the backend how many units are free for the chosen dates. This is what
  // keeps the quantity selector inside the real availability and lets the same
  // customer rent the same equipment again when stock is free.
  useEffect(() => {
    if (!hasValidDates) {
      return
    }

    const controller = new AbortController()
    const key = `${startDate}:${endDate}`

    getEquipmentAvailability(equipmentId, startDate, endDate, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setDateAvailability(result)
          setAvailabilityError(null)
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setDateAvailability(null)
        setAvailabilityError({
          key,
          message:
            error instanceof Error
              ? error.message
              : "Could not check availability for these dates.",
        })
      })

    return () => controller.abort()
  }, [equipmentId, startDate, endDate, hasValidDates])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (duration <= 0) {
      toast.error("Please select valid rental dates")
      return
    }

    if (checkingAvailability) {
      toast.error("Still checking availability. Please try again in a moment.")
      return
    }

    if (maxQuantity === 0) {
      toast.error("This equipment is fully booked for the selected dates.")
      return
    }

    if (effectiveQuantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} unit(s) are available for these dates.`)
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId,
          startDate,
          endDate,
          quantity: effectiveQuantity,
          phone,
          address,
          instructions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Payment session creation failed")
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL not found")
      }

      // Redirect customer to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error(error)

      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )

      setIsLoading(false)
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#80bd50] focus:ring-2 focus:ring-[#80bd50]/15"

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`Rent ${equipmentName}`}
      className="mt-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">Rental price</p>
          <p className="mt-1 text-2xl font-bold text-[#5b8c35]">
            {formatPrice(price)}
            <span className="ml-1 text-xs font-medium text-zinc-400">
              / {rentalUnit}
            </span>
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            canRent
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {checkingAvailability
            ? "Checking availability…"
            : availabilityMatchesDates
              ? `${dateAvailability.availableQuantity} for these dates`
              : `${availableQuantity} in stock`}
        </span>
      </div>

      <div className="border-t border-zinc-100" />

      <div>
        <h2 className="text-base font-bold text-zinc-900">
          Rent this equipment
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Fill in the details to request your rental.
        </p>
      </div>

      {/* Rental dates */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="startDate"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Rental start date
          </label>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

            <input
              id="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Rental end date
          </label>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

            <input
              id="endDate"
              type="date"
              required
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min={1}
          max={quantityLimit}
          required
          disabled={!canRent || checkingAvailability}
          value={effectiveQuantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Math.min(quantityLimit, Number(e.target.value) || 1))
            )
          }
          className={inputClass}
        />

        <p className="mt-2 text-xs text-zinc-500">
          {checkingAvailability
            ? "Checking availability for your dates…"
            : availabilityMatchesDates
              ? `${dateAvailability.availableQuantity} of ${dateAvailability.totalQuantity} unit(s) available for ${startDate} to ${endDate}.`
              : `${availableQuantity} unit(s) in total. Choose dates to see date-specific availability.`}
        </p>

        {availabilityErrorForDates ? (
          <p className="mt-1 text-xs text-red-600">
            {availabilityErrorForDates}
          </p>
        ) : null}
      </div>

      {/* Contact phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Contact phone
        </label>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

          <input
            id="phone"
            type="tel"
            required
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Delivery address */}
      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Delivery address
        </label>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 size-4 text-zinc-400" />

          <input
            id="address"
            type="text"
            required
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Special instructions */}
      <div>
        <label
          htmlFor="instructions"
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Special instructions
          <span className="ml-1 font-normal text-zinc-400">(Optional)</span>
        </label>

        <textarea
          id="instructions"
          rows={3}
          placeholder="Delivery instructions, additional requirements..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#80bd50] focus:ring-2 focus:ring-[#80bd50]/15"
        />
      </div>

      {/* Price summary */}
      <div className="rounded-2xl border border-zinc-200 bg-[#fafaf8] p-4">
        <div className="flex justify-between text-sm text-zinc-500">
          <span>
            {rentalUnits} {rentalUnit}
            {rentalUnits !== 1 ? "s" : ""} × {effectiveQuantity}
          </span>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        <div className="my-3 border-t border-zinc-200" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-zinc-800">Total amount</span>

          <span className="text-xl font-bold text-[#5b8c35]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isLoading || !canRent || duration <= 0 || checkingAvailability
        }
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2b2118] px-5 text-sm font-semibold text-white transition hover:bg-[#5b8c35] disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        <ShoppingBag className="size-4" />

        {isLoading ? "Redirecting to payment..." : "Pay & Rent"}
      </button>

      <p className="text-center text-xs text-zinc-400">
        Your rental request will be reviewed before confirmation.
      </p>
    </form>
  )
}
