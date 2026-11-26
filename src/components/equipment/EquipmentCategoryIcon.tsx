import {
  CameraIcon,
  CarIcon,
  DumbbellIcon,
  HardHatIcon,
  MusicIcon,
  PackageIcon,
  PartyPopperIcon,
  SprayCanIcon,
  TentIcon,
  TreesIcon,
  WrenchIcon,
} from "lucide-react"

import { normalizeEquipmentCategory } from "@/lib/fetch"

type EquipmentCategoryIconProps = {
  category: string
  className?: string
}

/**
 * Renders the icon for a category with a plain switch so React sees a stable
 * component instead of a component reference selected during render.
 */
export function EquipmentCategoryIcon({
  category,
  className,
}: EquipmentCategoryIconProps) {
  const props = { className, "aria-hidden": true as const }

  switch (normalizeEquipmentCategory(category)) {
    case "construction":
      return <HardHatIcon {...props} />
    case "power-tools":
      return <WrenchIcon {...props} />
    case "garden-outdoor":
      return <TreesIcon {...props} />
    case "photography-video":
      return <CameraIcon {...props} />
    case "audio-dj":
      return <MusicIcon {...props} />
    case "event-party":
      return <PartyPopperIcon {...props} />
    case "cleaning":
      return <SprayCanIcon {...props} />
    case "automotive":
      return <CarIcon {...props} />
    case "camping":
      return <TentIcon {...props} />
    case "sports-fitness":
      return <DumbbellIcon {...props} />
    default:
      return <PackageIcon {...props} />
  }
}
