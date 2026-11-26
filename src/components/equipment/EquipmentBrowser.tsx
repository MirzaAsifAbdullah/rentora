import { Suspense } from "react"

import { EquipmentFilters } from "@/components/equipment/EquipmentFilters"
import { EquipmentResults } from "@/components/equipment/EquipmentResults"
import { EquipmentResultsSkeleton } from "@/components/equipment/EquipmentSkeletons"
import { EquipmentToolbar } from "@/components/equipment/EquipmentToolbar"
import {
  buildEquipmentSearchParams,
  parseEquipmentFilters,
} from "@/lib/fetch"

type EquipmentBrowserProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * The URL is the single source of truth for the listing. This component reads
 * `searchParams`, normalises them and passes the same object to the client
 * controls (which write the URL) and the server results (which query Express).
 */
export async function EquipmentBrowser({
  searchParams,
}: EquipmentBrowserProps) {
  const filters = parseEquipmentFilters(await searchParams)
  const resultsKey = buildEquipmentSearchParams(filters).toString()

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <EquipmentFilters key={resultsKey} filters={filters} />
        </div>
      </div>

      <div className="min-w-0">
        <EquipmentToolbar key={resultsKey} filters={filters} />

        <div className="mt-6">
          <Suspense
            key={resultsKey}
            fallback={<EquipmentResultsSkeleton />}
          >
            <EquipmentResults filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
