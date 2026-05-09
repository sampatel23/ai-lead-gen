import { AddLeadModal } from "@/components/leads/AddLeadModal";
import { LeadsTable } from "@/components/leads/LeadsTable";

export function Leads() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Track, enrich, and manage your prospective clients with AI.
          </p>
        </div>
        <AddLeadModal />
      </div>

      <div className="min-h-[500px]">
        <LeadsTable />
      </div>
    </div>
  )
}
