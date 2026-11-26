import Link from "next/link"
import { headers } from "next/headers"
import { PackageSearchIcon, RefreshCwIcon, SearchXIcon } from "lucide-react"

import { EquipmentCard } from "@/components/equipment/EquipmentCard"
import { EquipmentPagination } from "@/components/equipment/EquipmentPagination"
import { auth } from "@/lib/auth"
import {
  buildEquipmentSearchParams,
  countActiveFilters,
  getEquipmentList,
  type EquipmentFilters,
} from "@/lib/fetch"

type EquipmentResultsProps = {
  filters: EquipmentFilters
}

export async function EquipmentResults({ filters }: EquipmentResultsProps) {
  const requestHeaders = await headers()

  const [listResult, sessionResult] = await Promise.allSettled([
    getEquipmentList(filters),
    auth.api.getSession({ headers: requestHeaders }),
  ])

  // A session lookup failure should only downgrade the card links to the
  // signed-out state; it must never hide an otherwise healthy listing.
  if (listResult.status === "rejected") {
    return <EquipmentErrorState filters={filters} />
  }

  const result = listResult.value
  const session = sessionResult.status === "fulfilled" ? sessionResult.value : null

  if (result.items.length === 0) {
    return <EquipmentEmptyState hasFilters={countActiveFilters(filters) > 0} />
  }

  const start = (result.page - 1) * result.limit + 1
  const end = Math.min(result.page * result.limit, result.total)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[12px] text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-800">
            {start}–{end}
          </span>{" "}
          of <span className="font-semibold text-zinc-800">{result.total}</span>{" "}
          equipment
        </p>

        <p className="hidden text-[11px] font-medium tracking-wide text-zinc-400 uppercase sm:block">
          Page {result.page} of {result.totalPages}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((equipment) => (
          <EquipmentCard
            key={equipment._id}
            equipment={equipment}
            isSignedIn={Boolean(session?.user)}
          />
        ))}
      </div>

      <EquipmentPagination
        filters={filters}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  )
}

function EquipmentEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#eef6e6] text-[#6da640]">
        <SearchXIcon className="size-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-900">
        {hasFilters ? "No equipment matches your filters" : "No equipment yet"}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-zinc-500">
        {hasFilters
          ? "Try a different category, location or price range, or clear the filters to see everything."
          : "Approved listings will appear here as soon as owners publish them."}
      </p>

      {hasFilters ? (
        <Link
          href="/equipment"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#2b2118] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#80bd50]"
        >
          <RefreshCwIcon className="size-3.5" />
          Clear all filters
        </Link>
      ) : (
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 text-[12px] font-semibold text-zinc-700 transition-colors hover:border-[#80bd50] hover:text-[#4f7d2a]"
        >
          <PackageSearchIcon className="size-3.5" />
          Back to home
        </Link>
      )}
    </div>
  )
}

function EquipmentErrorState({ filters }: { filters: EquipmentFilters }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <RefreshCwIcon className="size-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-900">
        Could not load equipment
      </h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-zinc-500">
        The marketplace service is not responding right now. Make sure the
        Express API is running, then try again.
      </p>
      <Link
        href={retryHref(filters)}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#2b2118] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#80bd50]"
      >
        <RefreshCwIcon className="size-3.5" />
        Try again
      </Link>
    </div>
  )
}

function retryHref(filters: EquipmentFilters) {
  const query = buildEquipmentSearchParams(filters).toString()

  return query ? `/equipment?${query}` : "/equipment"
}
