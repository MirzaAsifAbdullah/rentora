"use client"

import { useRouter } from "next/navigation"
import { HeartIcon } from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

type FavoriteButtonProps = {
  equipmentName: string
}

/**
 * Favourites are stored per customer, so the button routes guests to sign in.
 * The favourites collection/API is not wired up yet; signed-in users get a
 * clear message instead of a silent no-op.
 */
export function FavoriteButton({ equipmentName }: FavoriteButtonProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  function handleClick() {
    if (!session?.user) {
      toast.info("Sign in to save equipment to your favourites.")
      router.push("/sign-in")
      return
    }

    toast.info(`Favourites for "${equipmentName}" are coming soon.`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Save ${equipmentName} to favourites`}
      title="Save to favourites"
      className="group/heart inline-flex size-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition-all hover:border-white hover:bg-white hover:text-rose-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/70 disabled:opacity-60"
    >
      <HeartIcon className="size-4 transition-transform group-hover/heart:scale-110" />
    </button>
  )
}
