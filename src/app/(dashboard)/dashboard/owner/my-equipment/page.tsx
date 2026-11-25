"use client"

import Link from "next/link"
import { ShieldCheckIcon } from "lucide-react"

import { MyEquipmentManager } from "@/components/Dashboard/owner/MyEquipmentManager"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/lib/auth-client"

export default function OwnerMyEquipmentPage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </section>
    )
  }

  if (!session) {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Equipment
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the equipment you have listed.
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-10 text-center">
          <ShieldCheckIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You need to sign in with an owner account to manage equipment.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-none bg-[#80bd50] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#6da640]"
          >
            Go to sign in
          </Link>
        </div>
      </section>
    )
  }

  if (session.user.role !== "owner") {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Equipment
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the equipment you have listed.
          </p>
        </header>

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Your account role is{" "}
          <span className="font-semibold">{session.user.role}</span>. Only owner
          accounts can manage equipment listings.
        </div>
      </section>
    )
  }

  return <MyEquipmentManager />
}
