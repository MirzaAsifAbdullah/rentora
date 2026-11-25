"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Bike,
  Boxes,
  ChartColumn,
  ClipboardList,
  Heart,
  Home,
  LayoutDashboard,
  PackageOpen,
  PlusCircle,
  ShieldCheck,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DEFAULT_ROLE, isUserRole, type UserRole } from "@/lib/roles"

type SidebarItem = {
  title: string
  href: string
  icon: LucideIcon
}

const roleMeta: Record<UserRole, { label: string; icon: LucideIcon }> = {
  customer: { label: "Customer", icon: UserRound },
  owner: { label: "Owner", icon: Store },
  admin: { label: "Admin", icon: ShieldCheck },
}

const sidebarItems: Record<UserRole, SidebarItem[]> = {
  customer: [
    {
      title: "Overview",
      href: "/dashboard/customer/overview",
      icon: LayoutDashboard,
    },
    {
      title: "My Rentals",
      href: "/dashboard/customer/my-rentals",
      icon: PackageOpen,
    },
    {
      title: "Favorites",
      href: "/dashboard/customer/favorites",
      icon: Heart,
    },
    {
      title: "Profile",
      href: "/dashboard/customer/profile",
      icon: UserRound,
    },
  ],
  owner: [
    {
      title: "Overview",
      href: "/dashboard/owner/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Add Equipment",
      href: "/dashboard/owner/add-equipment",
      icon: PlusCircle,
    },
    {
      title: "My Equipment",
      href: "/dashboard/owner/my-equipment",
      icon: Boxes,
    },
    {
      title: "My Equipment Rentals",
      href: "/dashboard/owner/my-equipment-rental",
      icon: ClipboardList,
    },
    {
      title: "Analytics",
      href: "/dashboard/owner/analytics",
      icon: ChartColumn,
    },
    {
      title: "My Profile",
      href: "/dashboard/owner/profile",
      icon: UserRound,
    },
  ],
  admin: [
    {
      title: "Overview",
      href: "/dashboard/admin/overview",
      icon: LayoutDashboard,
    },
    {
      title: "All Users",
      href: "/dashboard/admin/all-users",
      icon: UsersRound,
    },
    {
      title: "All Equipment",
      href: "/dashboard/admin/all-equipment",
      icon: Boxes,
    },
    {
      title: "All Rentals",
      href: "/dashboard/admin/all-rentals",
      icon: ClipboardList,
    },
    {
      title: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: ChartColumn,
    },
    {
      title: "My Profile",
      href: "/dashboard/admin/profile",
      icon: UserRound,
    },
  ],
}

function getRoleFromPathname(pathname: string): UserRole {
  const role = pathname.split("/")[2]

  return isUserRole(role) ? role : DEFAULT_ROLE
}

export function AppSidebar() {
  const pathname = usePathname()
  const role = getRoleFromPathname(pathname)
  const items = sidebarItems[role]
  const { label, icon: RoleIcon } = roleMeta[role]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Rentora home"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#80bd50] text-white">
                <Bike className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Rentora</span>
                <span className="truncate text-xs text-muted-foreground">
                  {label} dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="gap-2">
            <RoleIcon className="size-4" />
            {label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to home"
              render={<Link href="/" />}
            >
              <Home />
              <span>Back to Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
