type DashboardPlaceholderProps = {
  title: string
  description: string
}

export function DashboardPlaceholder({
  title,
  description,
}: DashboardPlaceholderProps) {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-10">
        <p className="text-sm text-muted-foreground">
          {title} content will appear here.
        </p>
      </div>
    </section>
  )
}
