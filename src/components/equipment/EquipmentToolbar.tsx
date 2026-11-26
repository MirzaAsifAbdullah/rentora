"use client"

import { useState } from "react"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters"
import { useEquipmentQuery } from "@/hooks/use-equipment-query"
import {
  EQUIPMENT_SORT_OPTIONS,
  countActiveFilters,
  type EquipmentFilters as EquipmentFiltersState,
  type EquipmentSort,
} from "@/lib/fetch"

type EquipmentToolbarProps = {
  filters: EquipmentFiltersState
}

export function EquipmentToolbar({ filters }: EquipmentToolbarProps) {
  const { update, isPending } = useEquipmentQuery(filters)
  // Keyed by the parent on the serialised filters, so the field re-initialises
  // from the URL after a navigation.
  const [search, setSearch] = useState(filters.search)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeCount = countActiveFilters(filters)

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSearch = search.trim()

    if (nextSearch !== filters.search) {
      update({ search: nextSearch })
    }
  }

  function changeSort(sort: EquipmentSort) {
    if (sort !== filters.sort) {
      update({ sort })
    }
  }

  return (
    <div
      aria-busy={isPending}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center"
    >
      <form
        onSubmit={submitSearch}
        role="search"
        className="flex h-11 flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/70 py-1 pr-1 pl-4 transition-colors focus-within:border-[#80bd50] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#80bd50]/15"
      >
        <SearchIcon className="size-4 shrink-0 text-zinc-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by equipment name, category or brand..."
          aria-label="Search equipment"
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-zinc-800 outline-none placeholder:text-zinc-400 sm:text-sm"
        />
        <button
          type="submit"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#2b2118] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#80bd50] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#80bd50]/40"
        >
          Search
        </button>
      </form>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-700 transition-colors hover:border-[#80bd50] hover:text-[#4f7d2a] lg:hidden">
            <SlidersHorizontalIcon className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eef6e6] px-1.5 text-[11px] font-semibold text-[#4f7d2a]">
                {activeCount}
              </span>
            ) : null}
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[90vw] max-w-sm overflow-y-auto bg-[#f6f5f1] p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Equipment filters</SheetTitle>
              <SheetDescription>
                Narrow down the equipment list by category, location, rental
                type, price and availability.
              </SheetDescription>
            </SheetHeader>

            <div className="p-4">
              <EquipmentFilters filters={filters} />
            </div>
          </SheetContent>
        </Sheet>

        <label className="flex items-center gap-2">
          <span className="hidden text-[11px] font-semibold tracking-wide text-zinc-400 uppercase sm:block">
            Sort by
          </span>
          <span className="relative inline-flex">
            <select
              value={filters.sort}
              onChange={(event) =>
                changeSort(event.target.value as EquipmentSort)
              }
              aria-label="Sort equipment"
              className="h-10 appearance-none rounded-full border border-zinc-200 bg-white pr-9 pl-4 text-[13px] font-semibold text-zinc-700 outline-none transition-colors hover:border-[#80bd50] focus-visible:border-[#80bd50] focus-visible:ring-3 focus-visible:ring-[#80bd50]/15"
            >
              {EQUIPMENT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-zinc-400"
            >
              <path
                d="m6 8 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </label>
      </div>
    </div>
  )
}
