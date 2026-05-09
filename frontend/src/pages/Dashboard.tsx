export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your lead generation performance.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-muted rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-8 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Main Chart Area</p>
      </div>
    </div>
  )
}
