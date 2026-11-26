
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarCheckIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";
import { EquipmentBrowser } from "@/components/equipment/EquipmentBrowser";
import { EquipmentBrowserSkeleton } from "@/components/equipment/EquipmentSkeletons";



export const metadata: Metadata = {
  title: "All Equipment | Rentora",
  description: "Browse and rent equipment from different owners.",
};

type EquipmentPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

// Await searchParams inside this component
async function EquipmentContent({
  searchParams,
}: EquipmentPageProps) {
  const params = await searchParams;

  return <EquipmentBrowser searchParams={searchParams} />;
}

// This component must NOT be async
export default function EquipmentPage({
  searchParams,
}: EquipmentPageProps) {
  return (
    <main>
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Find the Right Equipment
            </h1>

            <p className="mt-4 text-muted-foreground">
              Browse quality equipment from different owners.
              Find what you need and rent it easily.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary" />
              <span className="text-sm">Trusted Listings</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <CalendarCheckIcon className="size-5 text-primary" />
              <span className="text-sm">Flexible Rentals</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <TruckIcon className="size-5 text-primary" />
              <span className="text-sm">Easy Booking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <Suspense fallback={<EquipmentBrowserSkeleton />}>
          <EquipmentContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
