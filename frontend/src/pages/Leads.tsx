export function Leads() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage and enrich your prospective clients.
          </p>
        </div>
        <div className="h-10 w-24 bg-primary/20 rounded-md animate-pulse" />
      </div>
      <div className="rounded-xl border bg-card p-8 h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Leads Data Table</p>
      </div>
    </div>
  )
}
