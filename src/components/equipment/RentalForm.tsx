
"use client"

import { useState } from "react"
import { CalendarDays, MapPin, Phone, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import { formatPrice, getRentalUnit } from "@/lib/equipment-display"

type RentalFormProps = {
  equipmentName: string
  price: number
  rentalType: string
  availableQuantity: number
}

export function RentalForm({
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

  // Calculate rental units
  let rentalUnits = duration

  if (rentalType.toLowerCase().includes("week")) {
    rentalUnits = Math.ceil(duration / 7)
  } else if (rentalType.toLowerCase().includes("month")) {
    rentalUnits = Math.ceil(duration / 30)
  }

  const totalPrice = price * rentalUnits * quantity

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    toast.info("Rental request submission will be available soon.")

    console.log({
      equipmentName,
      startDate,
      endDate,
      quantity,
      phone,
      address,
      instructions,
      duration,
      totalPrice,
    })
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#80bd50] focus:ring-2 focus:ring-[#80bd50]/15"

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">
            Rental price
          </p>
          <p className="mt-1 text-2xl font-bold text-[#5b8c35]">
            {formatPrice(price)}
            <span className="ml-1 text-xs font-medium text-zinc-400">
              / {rentalUnit}
            </span>
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {availableQuantity} in stock
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
          max={availableQuantity}
          required
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.min(
                availableQuantity,
                Math.max(1, Number(e.target.value))
              )
            )
          }
          className={inputClass}
        />
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
          <span className="ml-1 font-normal text-zinc-400">
            (Optional)
          </span>
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
            {rentalUnits !== 1 ? "s" : ""} × {quantity}
          </span>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        <div className="my-3 border-t border-zinc-200" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-zinc-800">
            Total amount
          </span>

          <span className="text-xl font-bold text-[#5b8c35]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={availableQuantity === 0}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2b2118] px-5 text-sm font-semibold text-white transition hover:bg-[#5b8c35] disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        <ShoppingBag className="size-4" />
        Submit Rental Request
      </button>

      <p className="text-center text-xs text-zinc-400">
        Your rental request will be reviewed before confirmation.
      </p>
    </form>
  )
}
