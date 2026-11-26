"use client"

import { CalendarPlusIcon } from "lucide-react"
import { toast } from "sonner"

type BookingButtonProps = {
  equipmentName: string
  disabled?: boolean
}

/**
 * The bookings/payments API is not live yet, so this stays an honest CTA
 * instead of pretending to create a booking.
 */
export function BookingButton({
  equipmentName,
  disabled = false,
}: BookingButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        toast.info(
          `Booking for "${equipmentName}" is coming soon. The rental request flow is not live yet.`
        )
      }
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2b2118] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#80bd50] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#80bd50]/40 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
    >
      <CalendarPlusIcon className="size-4" />
      {disabled ? "Currently unavailable" : "Request booking"}
    </button>
  )
}
