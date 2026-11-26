import type { Metadata } from "next"
import { Suspense } from "react"

import { EquipmentDetail } from "@/components/equipment/EquipmentDetail"
import { EquipmentDetailSkeleton } from "@/components/equipment/EquipmentSkeletons"

export const metadata: Metadata = {
  title: "Equipment details | Rentora",
  description:
    "Review the full specification, rental terms and availability of equipment on Rentora.",
}

export default function EquipmentDetailPage(
  props: PageProps<"/equipment/[id]">
) {
  return (
    <main className="min-h-screen bg-[#f6f5f1]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<EquipmentDetailSkeleton />}>
          <EquipmentDetail params={props.params} />
        </Suspense>
      </div>
    </main>
  )
}
