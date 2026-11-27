
"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  XCircle,
  CalendarDays,
  Package,
  CreditCard,
  ArrowRight,
} from "lucide-react"

import { API_BASE_URL } from "@/lib/fetch"

// Types
type CheckoutSessionStatus = {
  sessionId: string
  paymentStatus: string | null
  status: string | null
  amountTotal: number | null
  currency: string | null
  rental: {
    _id: string
    equipmentName: string
    rentalStatus: string
    paymentStatus: string
    startDate: string
    endDate: string
    quantity: number
    totalPrice: number
  } | null
}

// Rental status information
const RENTAL_STATUS_INFO: Record<
  string,
  { label: string; hint: string }
> = {
  pending: {
    label: "Pending owner confirmation",
    hint: "Your payment was successful. The owner still needs to confirm this rental.",
  },
  confirmed: {
    label: "Confirmed",
    hint: "The owner has confirmed your rental.",
  },
  active: {
    label: "Active",
    hint: "Your rental is currently active.",
  },
  completed: {
    label: "Completed",
    hint: "This rental has been returned and completed.",
  },
  cancelled: {
    label: "Cancelled",
    hint: "This rental was cancelled.",
  },
  needs_review: {
    label: "Needs review",
    hint: "An admin is reviewing this rental.",
  },
}

function rentalStatusInfo(value: string | undefined) {
  return (
    (value ? RENTAL_STATUS_INFO[value] : undefined) ?? {
      label: value ?? "Unknown",
      hint: "",
    }
  )
}

function formatAmount(amount: number, currency: string | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amount / 100)
}

// Main content
function RentalSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [status, setStatus] =
    useState<CheckoutSessionStatus | null>(null)
  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Verify payment
  useEffect(() => {
    if (!sessionId) return

    let cancelled = false

    fetch(
      `${API_BASE_URL}/checkout-session/${encodeURIComponent(sessionId)}`,
      { cache: "no-store" }
    )
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as
          | (CheckoutSessionStatus & { message?: string })
          | null

        if (!response.ok || !data) {
          throw new Error(
            data?.message ?? "Could not verify the payment."
          )
        }

        return data
      })
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not verify the payment."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, refreshKey])

  // Derived states
  const paid = status?.paymentStatus === "paid"
  const expired = status?.status === "expired"
  const rentalSaved = Boolean(status?.rental)
  const rentalInfo = rentalStatusInfo(
    status?.rental?.rentalStatus
  )

  const displayError =
    error ??
    (sessionId
      ? null
      : "The Stripe session id is missing from the URL.")

  // Refresh payment status
  function refresh() {
    setLoading(true)
    setError(null)
    setRefreshKey((current) => current + 1)
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
        <Loader2 className="mx-auto size-10 animate-spin text-[#6da640]" />
        <h2 className="mt-5 text-lg font-semibold text-zinc-900">
          Verifying your payment
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Please wait while we confirm your transaction.
        </p>
      </div>
    )
  }

  // Error state
  if (displayError) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle className="size-8" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-zinc-900">
          Payment verification failed
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {displayError}
        </p>

        <button
          onClick={refresh}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#2b2118] px-5 text-sm font-semibold text-white transition hover:bg-[#5b8c35]"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      </div>
    )
  }

  // Status configuration
  const statusConfig = paid
    ? {
        icon: CheckCircle2,
        title: "Payment received!",
        description:
          "Stripe confirmed your payment. Your rental is being saved to Rentora.",
        iconStyle: "bg-emerald-50 text-emerald-600",
      }
    : expired
      ? {
          icon: XCircle,
          title: "Payment was not completed",
          description:
            "Your checkout session has expired. No rental was created and no stock was reserved.",
          iconStyle: "bg-red-50 text-red-600",
        }
      : {
          icon: Clock3,
          title: "Payment is processing",
          description:
            "Stripe has not confirmed your payment yet. Please check your status again shortly.",
          iconStyle: "bg-amber-50 text-amber-600",
        }

  const StatusIcon = statusConfig.icon

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

      {/* Status Header */}
      <div className="px-6 py-10 text-center sm:px-10 sm:py-12">

        <div
          className={`mx-auto flex size-20 items-center justify-center rounded-full ${statusConfig.iconStyle}`}
        >
          <StatusIcon className="size-10" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {statusConfig.title}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          {statusConfig.description}
        </p>

        {/* Amount */}
        {status?.amountTotal != null && (
          <div className="mt-7">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Total amount
            </p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">
              {formatAmount(
                status.amountTotal,
                status.currency
              )}
            </p>
          </div>
        )}
      </div>

      {/* Rental Details */}
      {paid && rentalSaved && status?.rental && (
        <>
          <div className="border-y border-zinc-100 bg-[#fafaf8] px-6 py-5 sm:px-8">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <Package className="size-5 text-[#6da640]" />
              Rental details
            </h2>
          </div>

          <div className="space-y-5 p-6 sm:p-8">

            {/* Equipment */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Equipment
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-900">
                {status.rental.equipmentName || "Your rental"}
              </h3>
            </div>

            {/* Rental Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <CalendarDays className="size-4" />
                  <span className="text-xs font-medium uppercase">
                    Rental period
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold text-zinc-900">
                  {status.rental.startDate}
                </p>
                <p className="my-1 text-xs text-zinc-400">
                  to
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {status.rental.endDate}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Package className="size-4" />
                  <span className="text-xs font-medium uppercase">
                    Quantity
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-zinc-900">
                  {status.rental.quantity}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Unit(s)
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <CreditCard className="size-4" />
                Payment status
              </div>

              <span className="text-sm font-semibold text-emerald-700">
                {status.rental.paymentStatus === "paid"
                  ? "Paid"
                  : status.rental.paymentStatus}
              </span>
            </div>

            {/* Rental Status */}
            <div className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-900">
                  Rental status
                </p>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {rentalInfo.label}
                </span>
              </div>

              {rentalInfo.hint && (
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {rentalInfo.hint}
                </p>
              )}
            </div>

          </div>
        </>
      )}

      {/* Payment Successful but Rental Missing */}
      {paid && !rentalSaved && (
        <div className="mx-6 mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:mx-8">
          <h3 className="font-semibold text-amber-800">
            Payment confirmed, rental not saved yet
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            Stripe confirmed your payment, but the rental was
            not returned by the server. Refresh the status to
            ask the server to save it again. If the problem
            continues, check your Express server logs and the
            rentals collection.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-zinc-100 bg-[#fafaf8] p-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            <RefreshCw className="size-4" />
            Refresh status
          </button>

          <Link
            href="/equipment"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2b2118] px-5 text-sm font-semibold text-white transition hover:bg-[#5b8c35]"
          >
            Browse equipment
            <ArrowRight className="size-4" />
          </Link>

        </div>
      </div>
    </div>
  )
}

// Page
export default function RentalSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f6f5f1] px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-2xl">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#2b2118]"
          >
            Rentora<span className="text-[#6da640]">.</span>
          </Link>

          <p className="mt-2 text-sm text-zinc-500">
            Rental checkout
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
              <Loader2 className="mx-auto size-8 animate-spin text-[#6da640]" />
              <p className="mt-4 text-sm text-zinc-500">
                Loading checkout...
              </p>
            </div>
          }
        >
          <RentalSuccessContent />
        </Suspense>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Thank you for choosing Rentora.
        </p>

      </div>
    </main>
  )
}
