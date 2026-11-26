
import type { ReactNode } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Tag,
  UserRound,
} from "lucide-react"

import { BookingButton } from "@/components/equipment/BookingButton"
import { EquipmentCategoryIcon } from "@/components/equipment/EquipmentCategoryIcon"
import { EquipmentImage } from "@/components/equipment/EquipmentImage"
import { FavoriteButton } from "@/components/equipment/FavoriteButton"
import { auth } from "@/lib/auth"
import { getEquipmentById } from "@/lib/fetch"
import { EQUIPMENT_STATUS_HINTS } from "@/lib/equipment-meta"
import {
  formatPrice,
  getCategoryLabel,
  getCategoryShortLabel,
  getCategoryTone,
  getConditionLabel,
  getRentalUnit,
} from "@/lib/equipment-display"
import { cn } from "@/lib/utils"
import { RentalForm } from "./RentalForm"

type EquipmentDetailProps = {
  params: Promise<{ id: string }>
}

export async function EquipmentDetail({ params }: EquipmentDetailProps) {
  const { id } = await params

  const requestHeaders = await headers()
  const session = await auth.api
    .getSession({ headers: requestHeaders })
    .catch(() => null)

  if (!session?.user) {
    redirect("/sign-in")
  }

  const equipment = await getEquipmentById(id).catch(() => null)

  if (!equipment) {
    notFound()
  }

  const role = (session.user as { role?: string }).role
  const isOwner = equipment.ownerEmail === session.user.email
  const canPreview = isOwner || role === "admin"

  if (equipment.status !== "approved" && !canPreview) {
    notFound()
  }

  const available =
    equipment.isAvailable && (equipment.availableQuantity ?? 0) > 0

  const rentalUnit = getRentalUnit(equipment.rentalType)

  const brandLine = [equipment.brand, equipment.model]
    .filter(Boolean)
    .join(" · ")

  const ownerName = equipment.ownerName?.trim() || "Rentora owner"

  const statusHint = EQUIPMENT_STATUS_HINTS[equipment.status]

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <Link
        href="/equipment"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-[#5b8c35]"
      >
        <ArrowLeft className="size-4" />
        Back to equipment
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.85fr)] lg:gap-8">

        {/* Equipment image */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm lg:col-start-1 lg:row-start-1">
          <div className="relative aspect-[16/10] bg-zinc-100">
            <EquipmentImage
              src={equipment.image}
              alt={equipment.name}
            />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <FavoriteButton equipmentName={equipment.name} />

              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur",
                  available
                    ? "bg-emerald-500/95 text-white"
                    : "bg-zinc-800/90 text-white"
                )}
              >
                {available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Booking and price card */}
        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold",
                  getCategoryTone(equipment.category)
                )}
              >
                <EquipmentCategoryIcon
                  category={equipment.category}
                  className="size-4"
                />
                {getCategoryShortLabel(equipment.category)}
              </span>

              <span className="text-xs text-zinc-400">
                Rentora listing
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-3xl">
              {equipment.name}
            </h1>

            {brandLine && (
              <p className="mt-2 text-sm text-zinc-500">
                {brandLine}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              <MapPin className="size-4 shrink-0 text-[#6da640]" />
              {equipment.location}
            </div>

            <div className="my-6 border-t border-zinc-100" />

         
         <RentalForm
  equipmentName={equipment.name}
  price={equipment.price}
  rentalType={equipment.rentalType}
  availableQuantity={equipment.availableQuantity ?? 0}
/>

            {/* Equipment owner */}
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Listed by
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#edf5e7] text-sm font-bold text-[#5b8c35]">
                  {getInitials(ownerName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {ownerName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                    <UserRound className="size-3.5" />
                    Equipment owner
                  </p>
                </div>
              </div>
            </div>
          </div>

          {equipment.status !== "approved" && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Preview only
              </p>
              <p className={cn("mt-1 text-xs leading-5", statusHint.className)}>
                {statusHint.label}. This listing is not visible on the public
                marketplace yet.
              </p>
            </div>
          )}
        </aside>

        {/* Description and specifications */}
        <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-7 lg:col-start-1 lg:row-start-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              About this equipment
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-600">
              {equipment.description ||
                "The owner has not added a description yet."}
            </p>
          </div>

          <div className="my-7 border-t border-zinc-100" />

          <h2 className="text-lg font-bold text-zinc-900">
            Specifications
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Spec
              icon={<Tag />}
              label="Condition"
              value={getConditionLabel(equipment.condition)}
            />

            <Spec
              icon={<CalendarDays />}
              label="Rental type"
              value={`Per ${rentalUnit}`}
            />

            <Spec
              icon={<Boxes />}
              label="Available quantity"
              value={`${equipment.availableQuantity ?? 0} units`}
            />

            <Spec
              icon={<CircleDollarSign />}
              label="Rental price"
              value={`${formatPrice(equipment.price)} / ${rentalUnit}`}
            />
          </div>
        </section>

        {/* Rental terms */}
        <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-7 lg:col-start-1 lg:row-start-3">
          <h2 className="text-lg font-bold text-zinc-900">
            Rental terms
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-600">
            {equipment.terms ||
              "The owner has not added rental terms yet. Please confirm pickup, return and deposit details before booking."}
          </p>
        </section>

      </div>
    </div>
  )
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-[#fafaf8] p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf5e7] text-[#5b8c35] [&_svg]:size-4">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  )
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  )
}
