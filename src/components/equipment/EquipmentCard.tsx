import Link from "next/link"
import {
  ArrowRightIcon,
  MapPinIcon,
  SparklesIcon,
} from "lucide-react"
import { cn } from "cn"

import { EquipmentCategoryIcon } from "@/components/equipment/EquipmentCategoryIcon"
import { FavoriteButton } from "@/components/equipment/FavoriteButton"
import { EquipmentImage } from "@/components/equipment/EquipmentImage"
import type { Equipment } from "@/lib/fetch"
import {
  formatPrice,
  getCategoryShortLabel,
  getCategoryTone,
  getConditionLabel,
  getRentalUnit,
} from "@/lib/equipment-display"

type EquipmentCardProps = {
  equipment: Equipment
  isSignedIn: boolean
}

export function EquipmentCard({
  equipment,
  isSignedIn,
}: EquipmentCardProps) {
  const available =
    equipment.isAvailable && (equipment.availableQuantity ?? 0) > 0
  const detailsHref = isSignedIn
    ? `/equipment/${equipment._id}`
    : "/sign-in"
  const categoryTone = getCategoryTone(equipment.category)
  const rentalUnit = getRentalUnit(equipment.rentalType)
  const brandLine = [equipment.brand, equipment.model]
    .filter(Boolean)
    .join(" · ")

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#80bd50]/40 hover:shadow-[0_18px_40px_-24px_rgba(32,54,20,0.45)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <EquipmentImage
          src={equipment.image}
          alt={equipment.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <FavoriteButton equipmentName={equipment.name} />

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm backdrop-blur",
              available ? "bg-emerald-600/95" : "bg-zinc-700/90"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                available ? "bg-white" : "bg-zinc-300"
              )}
            />
            {available ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-zinc-900">
            {equipment.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-zinc-400">
            {brandLine || getConditionLabel(equipment.condition)}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
              categoryTone
            )}
          >
            <EquipmentCategoryIcon
              category={equipment.category}
              className="size-3"
            />
            {getCategoryShortLabel(equipment.category)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
            <SparklesIcon className="size-3 text-zinc-400" />
            {getConditionLabel(equipment.condition)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-zinc-500">
          <MapPinIcon className="size-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{equipment.location}</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-zinc-200 pt-4">
          <div className="min-w-0">
            <p className="text-lg leading-none font-bold text-amber-600">
              {formatPrice(equipment.price)}
              <span className="ml-0.5 text-[11px] font-semibold text-zinc-400">
                /{rentalUnit}
              </span>
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              {available
                ? `${equipment.availableQuantity} available`
                : "Currently out of stock"}
            </p>
          </div>

          <Link
            href={detailsHref}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#2b2118] px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#80bd50] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#80bd50]/40"
          >
            View Details
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
