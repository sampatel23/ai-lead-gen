import { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Search,
  Sparkles,
  Mail,
  RefreshCw,
  AlertCircle,
  Inbox,
  Trash2,
  Copy,
  RotateCcw,
  Plus,
  Loader2,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  useLeads,
  useEnrichLead,
  useGenerateEmail,
  useDeleteLead,
} from "@/hooks/useLeads";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import type { Lead } from "@/types/api";
import { toast } from "sonner";

interface LeadsTableProps {
  onAddLead?: () => void;
}

export function LeadsTable({ onAddLead }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: leads, isLoading, isError, refetch, isFetching } = useLeads();
  const enrichMutation = useEnrichLead();
  const emailMutation = useGenerateEmail();
  const deleteMutation = useDeleteLead();

  const filteredAndSortedLeads = useMemo(() => {
    let result = leads || [];

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.company_name.toLowerCase().includes(lowerSearch) ||
          lead.domain?.toLowerCase().includes(lowerSearch) ||
          lead.contact_person?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter) {
      if (statusFilter === "email_ready") {
        result = result.filter((lead) => !!lead.generated_email);
      } else {
        result = result.filter((lead) => lead.enrichment_status === statusFilter);
      }
    }

    // Sort by created_at
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [leads, searchTerm, statusFilter, sortOrder]);


  const openDrawer = (lead: Lead) => {
    // Sync selected lead from latest cache when drawer is already open
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  // Keep drawer lead in sync with the latest cache data
  const syncedDrawerLead =
    selectedLead && leads
      ? (leads.find((l) => l.id === selectedLead.id) ?? selectedLead)
      : selectedLead;

  const handleCopyEmail = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.generated_email) return;
    navigator.clipboard
      .writeText(lead.generated_email)
      .then(() => toast.success("Email copied to clipboard"))
      .catch(() => toast.error("Failed to copy email"));
  };

  if (isLoading) return <LeadsTableSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border rounded-xl bg-card gap-5 text-center">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Unable to load leads</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Check that the backend is running and refresh to try again.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
          id="retry-leads-btn"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by company, domain, or contact…"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="leads-search"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === null}
                onCheckedChange={() => setStatusFilter(null)}
              >
                All Leads
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "pending"}
                onCheckedChange={() => setStatusFilter("pending")}
              >
                Pending Enrichment
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "completed"}
                onCheckedChange={() => setStatusFilter("completed")}
              >
                Enriched
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "email_ready"}
                onCheckedChange={() => setStatusFilter("email_ready")}
              >
                Email Ready
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "failed"}
                onCheckedChange={() => setStatusFilter("failed")}
              >
                Failed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh leads"
            className="h-9 w-9 shrink-0"
            id="refresh-leads-btn"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          {filteredAndSortedLeads.length > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {filteredAndSortedLeads.length}{" "}
              {filteredAndSortedLeads.length === 1 ? "lead" : "leads"}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Industry</TableHead>
                <TableHead className="font-semibold cursor-pointer select-none group" onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}>
                  <div className="flex items-center gap-1">
                    Created
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-72 text-center">
                    {searchTerm || statusFilter ? (
                      <SearchEmptyState
                        query={searchTerm}
                        onClear={() => {
                          setSearchTerm("");
                          setStatusFilter(null);
                        }}
                      />
                    ) : (
                      <OnboardingEmptyState onAddLead={onAddLead} />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => openDrawer(lead)}
                    id={`lead-row-${lead.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                          {lead.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {lead.company_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.domain || "No domain"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.contact_person || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge
                        status={lead.enrichment_status}
                        hasEmail={!!lead.generated_email}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.industry || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                            id={`actions-menu-${lead.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                            Lead Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* Enrich */}
                          <DropdownMenuItem
                            className="gap-2 text-sm"
                            disabled={
                              lead.enrichment_status === "completed" ||
                              lead.enrichment_status === "enriched" ||
                              enrichMutation.isPending
                            }
                            onClick={() => enrichMutation.mutate(lead.id)}
                            id={`enrich-action-${lead.id}`}
                          >
                            {enrichMutation.isPending &&
                            enrichMutation.variables === lead.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-violet-500" />
                            )}
                            Enrich Lead
                          </DropdownMenuItem>

                          {/* Generate / Regenerate Email */}
                          <DropdownMenuItem
                            className="gap-2 text-sm"
                            disabled={
                              (lead.enrichment_status !== "completed" &&
                                lead.enrichment_status !== "enriched") ||
                              emailMutation.isPending
                            }
                            onClick={() => emailMutation.mutate(lead.id)}
                            id={`generate-email-action-${lead.id}`}
                          >
                            {emailMutation.isPending &&
                            emailMutation.variables === lead.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : lead.generated_email ? (
                              <RotateCcw className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-500" />
                            )}
                            {lead.generated_email
                              ? "Regenerate Email"
                              : "Generate Email"}
                          </DropdownMenuItem>

                          {/* Copy Email */}
                          <DropdownMenuItem
                            className="gap-2 text-sm"
                            disabled={!lead.generated_email}
                            onClick={(e) => handleCopyEmail(lead, e)}
                            id={`copy-email-action-${lead.id}`}
                          >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                            Copy Email
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Refresh data */}
                          <DropdownMenuItem
                            className="gap-2 text-sm"
                            onClick={() => refetch()}
                            id={`refresh-action-${lead.id}`}
                          >
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            Refresh Data
                          </DropdownMenuItem>

                          {/* Delete */}
                          <DropdownMenuItem
                            className="gap-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(lead.id)}
                            id={`delete-action-${lead.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Drawer */}
      <LeadDetailDrawer
        lead={syncedDrawerLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

// ── Empty states ───────────────────────────────────────────────────────

function OnboardingEmptyState({ onAddLead }: { onAddLead?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No leads yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add your first lead to get started with AI enrichment.
        </p>
      </div>
      {onAddLead && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAddLead}
          className="gap-1.5 text-xs"
          id="empty-state-add-lead-btn"
        >
          <Plus className="h-3.5 w-3.5" />
          Add a Lead
        </Button>
      )}
    </div>
  );
}

function SearchEmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No results for "{query}"</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try a different company name, domain, or contact.
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="text-xs"
        id="clear-search-btn"
      >
        Clear search
      </Button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────

function LeadsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-3 border-b bg-muted/40">
          <div className="grid grid-cols-6 gap-4">
            {["Company", "Contact", "Status", "Industry", "Created", ""].map(
              (_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              )
            )}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-8 w-8 rounded-md justify-self-end" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
