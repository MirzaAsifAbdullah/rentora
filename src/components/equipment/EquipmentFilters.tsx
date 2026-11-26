"use client"

import { useState } from "react"
import { MapPinIcon, RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useEquipmentQuery } from "@/hooks/use-equipment-query"
import {
  EQUIPMENT_CATEGORIES,
  RENTAL_TYPES,
  countActiveFilters,
  type EquipmentCategory,
  type EquipmentFilters as EquipmentFilterState,
  type RentalType,
} from "@/lib/fetch"
import { EQUIPMENT_CATEGORY_SHORT_LABELS } from "@/lib/equipment-meta"

type EquipmentFiltersProps = {
  filters: EquipmentFilterState
  className?: string
}

export function EquipmentFilters({
  filters,
  className,
}: EquipmentFiltersProps) {
  const { update, reset, isPending } = useEquipmentQuery(filters)

  // The parent keys this component by the serialised filters, so the text
  // fields re-initialise from the URL after every navigation.
  const [location, setLocation] = useState(filters.location)
  const [minPrice, setMinPrice] = useState(filters.minPrice)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice)

  const activeCount = countActiveFilters(filters)
  const hasDraftText =
    location.trim() !== filters.location ||
    minPrice.trim() !== filters.minPrice ||
    maxPrice.trim() !== filters.maxPrice
  const canClear = activeCount > 0 || hasDraftText

  /**
   * Includes text that has been typed but not blurred yet, so toggling a
   * checkbox never discards a half-entered location or price range.
   */
  function draftTextFilters() {
    return {
      location: location.trim(),
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
    }
  }

  function clearAll() {
    setLocation("")
    setMinPrice("")
    setMaxPrice("")
    reset()
  }

  function toggleCategory(category: EquipmentCategory) {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((value) => value !== category)
      : [...filters.categories, category]

    update({ categories, ...draftTextFilters() })
  }

  function toggleRentalType(rentalType: RentalType) {
    const rentalTypes = filters.rentalTypes.includes(rentalType)
      ? filters.rentalTypes.filter((value) => value !== rentalType)
      : [...filters.rentalTypes, rentalType]

    update({ rentalTypes, ...draftTextFilters() })
  }

  function commitLocation() {
    const nextLocation = location.trim()

    if (nextLocation !== filters.location) {
      update({ location: nextLocation })
    }
  }

  function commitPrices() {
    const nextMin = minPrice.trim()
    const nextMax = maxPrice.trim()

    if (nextMin !== filters.minPrice || nextMax !== filters.maxPrice) {
      update({ minPrice: nextMin, maxPrice: nextMax })
    }
  }

  return (
    <aside
      aria-busy={isPending}
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-opacity",
        isPending && "opacity-70",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <SlidersHorizontalIcon className="size-4 text-[#6da640]" />
          Filters
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eef6e6] px-1.5 text-[11px] font-semibold text-[#4f7d2a]">
              {activeCount}
            </span>
          ) : null}
        </h2>

        {canClear ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-[#6da640] transition-colors hover:text-[#4f7d2a]"
          >
            Reset
          </button>
        ) : null}
      </div>

      <FilterSection title="Category">
        <div className="space-y-2.5">
          {EQUIPMENT_CATEGORIES.map((category) => {
            const checked = filters.categories.includes(category.value)

            return (
              <label
                key={category.value}
                className="group flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-600 transition-colors hover:text-zinc-900"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCategory(category.value)}
                  aria-label={`Filter by ${category.label}`}
                  className="border-zinc-300 data-checked:border-[#6da640] data-checked:bg-[#6da640]"
                />
                <span className="leading-5">
                  {EQUIPMENT_CATEGORY_SHORT_LABELS[category.value]}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <div className="relative">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onBlur={commitLocation}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitLocation()
              }
            }}
            placeholder="e.g. Dhaka, Sylhet..."
            aria-label="Filter by location"
            className="h-10 rounded-lg border-zinc-200 bg-zinc-50/60 pl-9 text-[13px] focus-visible:border-[#80bd50] focus-visible:ring-[#80bd50]/20"
          />
        </div>
      </FilterSection>

      <FilterSection title="Rental Type">
        <div className="space-y-2.5">
          {RENTAL_TYPES.map((rentalType) => {
            const checked = filters.rentalTypes.includes(rentalType.value)

            return (
              <label
                key={rentalType.value}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-600 transition-colors hover:text-zinc-900"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleRentalType(rentalType.value)}
                  aria-label={`Filter by ${rentalType.label} rentals`}
                  className="border-zinc-300 data-checked:border-[#6da640] data-checked:bg-[#6da640]"
                />
                <span className="leading-5">{rentalType.label}</span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <Input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            onBlur={commitPrices}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitPrices()
              }
            }}
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            className="h-10 rounded-lg border-zinc-200 bg-zinc-50/60 text-[13px] focus-visible:border-[#80bd50] focus-visible:ring-[#80bd50]/20"
          />
          <span className="text-xs text-zinc-400">—</span>
          <Input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            onBlur={commitPrices}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitPrices()
              }
            }}
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            className="h-10 rounded-lg border-zinc-200 bg-zinc-50/60 text-[13px] focus-visible:border-[#80bd50] focus-visible:ring-[#80bd50]/20"
          />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-zinc-400">
          Press Enter or leave the field to apply.
        </p>
      </FilterSection>

      <FilterSection title="Availability" last>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-600 transition-colors hover:text-zinc-900">
          <Checkbox
            checked={filters.availableOnly}
            onCheckedChange={(checked) =>
              update({
                availableOnly: checked === true,
                ...draftTextFilters(),
              })
            }
            aria-label="Show available equipment only"
            className="border-zinc-300 data-checked:border-[#6da640] data-checked:bg-[#6da640]"
          />
          <span className="leading-5">Available only</span>
        </label>
      </FilterSection>

      <Button
        type="button"
        variant="outline"
        onClick={clearAll}
        disabled={!canClear}
        className="mt-5 h-10 w-full gap-2 rounded-full border-zinc-200 bg-white text-[13px] font-semibold text-zinc-700 hover:border-[#80bd50] hover:bg-[#f4f9ef] hover:text-[#4f7d2a] disabled:opacity-50"
      >
        <RotateCcwIcon className="size-3.5" />
        Clear All Filters
      </Button>
    </aside>
  )
}

function FilterSection({
  title,
  children,
  last = false,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <section
      className={cn(
        "space-y-3 py-4",
        !last && "border-b border-zinc-100"
      )}
    >
      <h3 className="text-[11px] font-bold tracking-[0.12em] text-zinc-500 uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}
