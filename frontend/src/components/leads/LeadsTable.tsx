import { useState } from "react";
import { 
  MoreHorizontal, 
  Search, 
  Sparkles, 
  Mail, 
  RefreshCw,
  AlertCircle,
  Inbox
} from "lucide-react";
import { useLeads, useEnrichLead, useGenerateEmail } from "@/hooks/useLeads";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead } from "@/types/api";

export function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: leads, isLoading, isError, refetch } = useLeads();
  const enrichMutation = useEnrichLead();
  const emailMutation = useGenerateEmail();

  const filteredLeads = leads?.filter((lead) =>
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LeadsTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-xl bg-card gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load leads</h3>
          <p className="text-muted-foreground">Please check your backend connection and try again.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads by company, domain or contact..."
          className="pl-10 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Industry</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No leads found.</p>
                    {searchTerm && (
                      <Button variant="link" onClick={() => setSearchTerm("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-medium">{lead.company_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.domain || "No domain"}</div>
                  </TableCell>
                  <TableCell>{lead.contact_person || "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.enrichment_status} />
                  </TableCell>
                  <TableCell>{lead.industry || "-"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2"
                          disabled={lead.enrichment_status === "completed" || enrichMutation.isPending}
                          onClick={() => enrichMutation.mutate(lead.id)}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          Enrich Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2"
                          disabled={lead.enrichment_status !== "completed" || emailMutation.isPending}
                          onClick={() => emailMutation.mutate(lead.id)}
                        >
                          <Mail className="h-4 w-4 text-blue-500" />
                          Generate Email
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
  );
}

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">Enriched</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "pending":
    case "processing":
      return <Badge variant="secondary" className="animate-pulse">Processing</Badge>;
    default:
      return <Badge variant="secondary">New</Badge>;
  }
}

function LeadsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8 justify-self-end" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full justify-self-end" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
