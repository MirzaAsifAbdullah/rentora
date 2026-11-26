"use client"

import { useCallback, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import {
  buildEquipmentSearchParams,
  type EquipmentFilters,
} from "@/lib/fetch"

type UpdateOptions = {
  /** Filter changes reset the listing to page 1 unless explicitly disabled. */
  resetPage?: boolean
  /** `replace` is handy for text inputs so typing does not fill history. */
  replace?: boolean
}

/**
 * Writes the equipment filters into the URL. The server page reads
 * `searchParams`, so the Express API always receives the current query and
 * the browser never filters a full in-memory list.
 */
export function useEquipmentQuery(filters: EquipmentFilters) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const update = useCallback(
    (patch: Partial<EquipmentFilters>, options: UpdateOptions = {}) => {
      const resetPage = options.resetPage ?? true
      const next: EquipmentFilters = {
        ...filters,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? filters.page),
      }

      const params = buildEquipmentSearchParams(next).toString()
      const url = params ? `${pathname}?${params}` : pathname

      startTransition(() => {
        if (options.replace) {
          router.replace(url, { scroll: false })
        } else {
          router.push(url, { scroll: false })
        }
      })
    },
    [filters, pathname, router]
  )

  const reset = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [pathname, router])

  return { update, reset, isPending }
}
