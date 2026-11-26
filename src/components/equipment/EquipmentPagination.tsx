import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import {
  buildEquipmentSearchParams,
  type EquipmentFilters,
} from "@/lib/fetch"

type EquipmentPaginationProps = {
  filters: EquipmentFilters
  page: number
  totalPages: number
}

function pageHref(filters: EquipmentFilters, page: number) {
  const params = buildEquipmentSearchParams({ ...filters, page }).toString()

  return params ? `/equipment?${params}` : "/equipment"
}

/** First page, last page, the current page and its neighbours. */
function getPageItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) {
    items.push("ellipsis-start")
  }

  for (let value = start; value <= end; value += 1) {
    items.push(value)
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-end")
  }

  items.push(totalPages)

  return items
}

export function EquipmentPagination({
  filters,
  page,
  totalPages,
}: EquipmentPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const items = getPageItems(page, totalPages)

  return (
    <nav
      aria-label="Equipment pagination"
      className="mt-9 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={pageHref(filters, page - 1)}
          aria-label="Previous page"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 transition-colors hover:border-[#80bd50] hover:text-[#4f7d2a]"
        >
          <ChevronLeftIcon className="size-4" />
          Prev
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-3 text-[12px] font-semibold text-zinc-300">
          <ChevronLeftIcon className="size-4" />
          Prev
        </span>
      )}

      {items.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="inline-flex size-9 items-center justify-center text-sm text-zinc-400"
            >
              …
            </span>
          )
        }

        const isCurrent = item === page

        return (
          <Link
            key={item}
            href={pageHref(filters, item)}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors",
              isCurrent
                ? "border-[#2b2118] bg-[#2b2118] text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-[#80bd50] hover:text-[#4f7d2a]"
            )}
          >
            {item}
          </Link>
        )
      })}

      {page < totalPages ? (
        <Link
          href={pageHref(filters, page + 1)}
          aria-label="Next page"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 transition-colors hover:border-[#80bd50] hover:text-[#4f7d2a]"
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-3 text-[12px] font-semibold text-zinc-300">
          Next
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}
