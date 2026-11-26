"use client"

import { useEffect, useRef, useState } from "react"
import { ImageOffIcon } from "lucide-react"
import { cn } from "cn"

type EquipmentImageProps = {
  src: string
  alt: string
  className?: string
}

/**
 * Remote ImgBB/Unsplash URLs are not configured in `next.config.ts`, so the
 * listing uses a plain <img> with a graceful fallback for broken links.
 */
export function EquipmentImage({ src, alt, className }: EquipmentImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = !src || failedSrc === src

  // The image can fail before React hydrates, in which case `onError` never
  // fires. Check the already-loaded element once it mounts.
  useEffect(() => {
    const image = imageRef.current

    if (image?.complete && image.naturalWidth === 0) {
      setFailedSrc(src)
    }
  }, [src])

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400",
          className
        )}
      >
        <ImageOffIcon className="size-8" />
        <span className="text-[11px] font-medium">Image unavailable</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={cn("h-full w-full object-cover", className)}
    />
  )
}
