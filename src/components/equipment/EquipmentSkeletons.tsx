import { Skeleton } from "@/components/ui/skeleton"

function EquipmentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-end justify-between border-t border-dashed border-zinc-200 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function EquipmentResultsSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="hidden h-3.5 w-24 sm:block" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <EquipmentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export function EquipmentBrowserSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-5">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-3 border-t border-zinc-100 pt-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <Skeleton className="h-[68px] w-full rounded-2xl" />
        <div className="mt-6">
          <EquipmentResultsSkeleton />
        </div>
      </div>
    </div>
  )
}

export function EquipmentDetailSkeleton() {
  return (
    <div className="pb-16">
      <Skeleton className="h-4 w-40" />

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,1fr)] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />

          <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="mt-3 h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-5 h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-12 w-full rounded-full" />
          <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
