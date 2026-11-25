"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  PackageOpenIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditEquipmentDialog } from "@/components/Dashboard/owner/EditEquipmentDialog"
import {
  deleteEquipmentAction,
  getMyEquipmentsAction,
  updateEquipmentAction,
} from "@/lib/action"
import {
  EQUIPMENT_CATEGORIES,
  type Equipment,
  type EquipmentCategory,
} from "@/lib/fetch"
import {
  EQUIPMENT_CATEGORY_SHORT_LABELS,
  EQUIPMENT_CATEGORY_TONES,
  EQUIPMENT_STATUS_HINTS,
} from "@/lib/equipment-meta"

type DateRange = "all" | "this-month" | "last-month"

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
]

type DeleteTarget = {
  ids: string[]
  label: string
}

export function MyEquipmentManager() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [range, setRange] = useState<DateRange>("this-month")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null)
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getMyEquipmentsAction()

    if (result.success) {
      setEquipments(result.data)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    getMyEquipmentsAction()
      .then((result) => {
        if (cancelled) {
          return
        }

        if (result.success) {
          setEquipments(result.data)
        } else {
          setError(result.message)
        }

        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setError(
          error instanceof Error
            ? error.message
            : "Could not load your equipment."
        )
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleEquipments = useMemo(() => {
    const now = new Date()

    return equipments.filter((equipment) => {
      if (range === "all") {
        return true
      }

      const createdAt = new Date(equipment.createdAt)

      if (Number.isNaN(createdAt.getTime())) {
        return true
      }

      if (range === "this-month") {
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        )
      }

      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      return (
        createdAt.getMonth() === previousMonth.getMonth() &&
        createdAt.getFullYear() === previousMonth.getFullYear()
      )
    })
  }, [equipments, range])

  const visibleIds = useMemo(
    () => visibleEquipments.map((equipment) => equipment._id),
    [visibleEquipments]
  )

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id))
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id))

  function toggleAll(checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleIds]))
      }

      return current.filter((id) => !visibleIds.includes(id))
    })
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    )
  }

  function changeRange(nextRange: DateRange) {
    setRange(nextRange)
    setSelectedIds([])
  }

  async function handleAvailabilityChange(
    equipment: Equipment,
    isAvailable: boolean
  ) {
    const previousValue = equipment.isAvailable

    setSavingStatusId(equipment._id)
    setEquipments((current) =>
      current.map((item) =>
        item._id === equipment._id ? { ...item, isAvailable } : item
      )
    )

    try {
      const result = await updateEquipmentAction(equipment._id, {
        isAvailable,
      })

      if (!result.success) {
        setEquipments((current) =>
          current.map((item) =>
            item._id === equipment._id
              ? { ...item, isAvailable: previousValue }
              : item
          )
        )
        toast.error(result.message)
        return
      }

      setEquipments((current) =>
        current.map((item) =>
          item._id === equipment._id ? { ...item, ...result.data } : item
        )
      )
      toast.success(
        isAvailable
          ? "Listing is now available for rent."
          : "Listing is now hidden from customers."
      )
    } catch (error) {
      setEquipments((current) =>
        current.map((item) =>
          item._id === equipment._id
            ? { ...item, isAvailable: previousValue }
            : item
        )
      )
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update availability."
      )
    } finally {
      setSavingStatusId(null)
    }
  }

  async function handleCategoryChange(
    equipment: Equipment,
    category: EquipmentCategory
  ) {
    if (category === equipment.category) {
      return
    }

    const previousCategory = equipment.category

    setSavingCategoryId(equipment._id)
    setEquipments((current) =>
      current.map((item) =>
        item._id === equipment._id ? { ...item, category } : item
      )
    )

    try {
      const result = await updateEquipmentAction(equipment._id, { category })

      if (!result.success) {
        setEquipments((current) =>
          current.map((item) =>
            item._id === equipment._id
              ? { ...item, category: previousCategory }
              : item
          )
        )
        toast.error(result.message)
        return
      }

      setEquipments((current) =>
        current.map((item) =>
          item._id === equipment._id ? { ...item, ...result.data } : item
        )
      )
      toast.success("Category updated.")
    } catch (error) {
      setEquipments((current) =>
        current.map((item) =>
          item._id === equipment._id
            ? { ...item, category: previousCategory }
            : item
        )
      )
      toast.error(
        error instanceof Error ? error.message : "Could not update category."
      )
    } finally {
      setSavingCategoryId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      const results = await Promise.all(
        deleteTarget.ids.map((id) => deleteEquipmentAction(id))
      )

      const deletedIds = deleteTarget.ids.filter(
        (_, index) => results[index].success
      )
      const failed = results.filter((result) => !result.success)

      if (deletedIds.length > 0) {
        setEquipments((current) =>
          current.filter((equipment) => !deletedIds.includes(equipment._id))
        )
        setSelectedIds((current) =>
          current.filter((id) => !deletedIds.includes(id))
        )
      }

      if (failed.length > 0) {
        toast.error(failed[0].message)
      } else {
        toast.success(
          deletedIds.length === 1
            ? "Equipment deleted successfully."
            : `${deletedIds.length} equipment items deleted successfully.`
        )
      }

      setDeleteTarget(null)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the equipment. Please try again."
      )
    } finally {
      setDeleting(false)
    }
  }

  function handleSaved(updated: Equipment) {
    setEquipments((current) =>
      current.map((item) =>
        item._id === updated._id ? { ...item, ...updated } : item
      )
    )
    setEditing(null)
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Equipment
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage every product you have listed. Toggle availability, edit
            details or remove a listing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
         <Button
  nativeButton={false}
  render={<Link href="/dashboard/owner/add-equipment" />}
  className="h-10 gap-2 rounded-none bg-[#80bd50] px-5 font-semibold text-white hover:bg-[#6da640]"
>
  <PlusIcon className="size-4" />
  Add Product
</Button>

          <DateRangeMenu value={range} onChange={changeRange} />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">All Products</h2>
            {!loading && !error ? (
              <Badge variant="secondary" className="rounded-full">
                {visibleEquipments.length}
              </Badge>
            ) : null}
          </div>

          {selectedIds.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 rounded-none px-3"
              onClick={() =>
                setDeleteTarget({
                  ids: selectedIds,
                  label: `${selectedIds.length} selected product${
                    selectedIds.length === 1 ? "" : "s"
                  }`,
                })
              }
            >
              <Trash2Icon className="size-4" />
              Delete selected ({selectedIds.length})
            </Button>
          ) : null}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visibleEquipments.length === 0 ? (
          <EmptyState
            hasEquipment={equipments.length > 0}
            onShowAll={() => changeRange("all")}
          />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 pl-5">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && someVisibleSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Product Name
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Price
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Category
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="h-12 pr-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleEquipments.map((equipment) => {
                const isSelected = selectedIds.includes(equipment._id)
                const statusHint =
                  EQUIPMENT_STATUS_HINTS[equipment.status] ??
                  EQUIPMENT_STATUS_HINTS.pending

                return (
                  <TableRow
                    key={equipment._id}
                    data-state={isSelected ? "selected" : undefined}
                    className="h-20"
                  >
                    <TableCell className="pl-5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleRow(equipment._id, checked === true)
                        }
                        aria-label={`Select ${equipment.name}`}
                      />
                    </TableCell>

                    <TableCell className="max-w-[320px]">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                          {equipment.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={equipment.image}
                              alt={equipment.name}
                              loading="lazy"
                              className="size-full object-contain p-1"
                            />
                          ) : (
                            <PackageOpenIcon className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {equipment.name}
                          </p>
                          <p
                            className={cn(
                              "truncate text-xs",
                              equipment.status !== "approved"
                                ? statusHint.className
                                : "text-muted-foreground"
                            )}
                          >
                            {equipment.status !== "approved"
                              ? statusHint.label
                              : [equipment.brand, equipment.model]
                                  .filter(Boolean)
                                  .join(" · ")}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium tabular-nums">
                      ${Number(equipment.price).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <CategoryPill
                        equipment={equipment}
                        saving={savingCategoryId === equipment._id}
                        onChange={(category) =>
                          handleCategoryChange(equipment, category)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={equipment.isAvailable}
                          disabled={savingStatusId === equipment._id}
                          onCheckedChange={(checked) =>
                            handleAvailabilityChange(
                              equipment,
                              checked === true
                            )
                          }
                          aria-label={`Toggle availability for ${equipment.name}`}
                          title={
                            equipment.isAvailable
                              ? "Available for rent — click to hide"
                              : "Unavailable — click to make available"
                          }
                          className="data-checked:bg-[#3b82f6] dark:data-checked:bg-[#3b82f6]"
                        />
                        {savingStatusId === equipment._id ? (
                          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => setEditing(equipment)}
                          aria-label={`Edit ${equipment.name}`}
                          title="Edit product"
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 rounded-full text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              ids: [equipment._id],
                              label: equipment.name,
                            })
                          }
                          aria-label={`Delete ${equipment.name}`}
                          title="Delete product"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {editing ? (
        <EditEquipmentDialog
          key={editing._id}
          equipment={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      ) : null}

      <DeleteEquipmentDialog
        target={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}

function DateRangeMenu({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
}) {
  const current = DATE_RANGES.find((range) => range.value === value)

  return (
    // TODO(api): move this date-range filter into the /all-equipments query
    // (MongoDB) once the API supports server-side date filtering.
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
        <CalendarIcon className="size-4 text-muted-foreground" />
        {current?.label ?? "All Time"}
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
          {DATE_RANGES.map((range) => (
            <DropdownMenuItem
              key={range.value}
              onClick={() => onChange(range.value)}
            >
              {range.label}
              {range.value === value ? (
                <CheckIcon className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CategoryPill({
  equipment,
  saving,
  onChange,
}: {
  equipment: Equipment
  saving: boolean
  onChange: (category: EquipmentCategory) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={saving}
        aria-label={`Change category for ${equipment.name}`}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
          EQUIPMENT_CATEGORY_TONES[equipment.category] ??
            EQUIPMENT_CATEGORY_TONES.other
        )}
      >
        {EQUIPMENT_CATEGORY_SHORT_LABELS[equipment.category] ??
          equipment.category}
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Change category</DropdownMenuLabel>
          {EQUIPMENT_CATEGORIES.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onClick={() => onChange(category.value)}
            >
              {EQUIPMENT_CATEGORY_SHORT_LABELS[category.value]}
              {equipment.category === category.value ? (
                <CheckIcon className="ml-auto size-4" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DeleteEquipmentDialog({
  target,
  deleting,
  onCancel,
  onConfirm,
}: {
  target: DeleteTarget | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const isBulk = (target?.ids.length ?? 0) > 1

  return (
    <AlertDialog
      open={Boolean(target)}
      onOpenChange={(open) => {
        if (!open && !deleting) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isBulk
              ? `Delete ${target?.ids.length} products?`
              : "Delete this product?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">
              {target?.label}
            </span>{" "}
            will be permanently removed from your listings. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2Icon className="size-4" />
                {isBulk ? "Delete all" : "Delete"}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-5">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="size-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-7 w-24 md:block" />
          <Skeleton className="hidden h-5 w-9 sm:block" />
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  hasEquipment,
  onShowAll,
}: {
  hasEquipment: boolean
  onShowAll: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <PackageOpenIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasEquipment ? "No products in this period" : "No equipment yet"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasEquipment
            ? "Try a wider date range to see the rest of your listings."
            : "Add your first product so customers can start renting it."}
        </p>
      </div>
      {hasEquipment ? (
        <Button variant="outline" size="sm" onClick={onShowAll}>
          Show all time
        </Button>
      ) : (
        <Button
          render={<Link href="/dashboard/owner/add-equipment" />}
          className="h-9 gap-2 rounded-none bg-[#80bd50] px-4 font-semibold text-white hover:bg-[#6da640]"
        >
          <PlusIcon className="size-4" />
          Add Product
        </Button>
      )}
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlertIcon className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Could not load your equipment</p>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
        <RefreshCwIcon className="size-4" />
        Try again
      </Button>
    </div>
  )
}
