import {
  Building2,
  Globe,
  User,
  Calendar,
  Clock,
  Sparkles,
  Mail,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Target,
  Lightbulb,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { EmailDisplay } from "./EmailDisplay";
import {
  useEnrichLead,
  useGenerateEmail,
  useDeleteLead,
} from "@/hooks/useLeads";
import type { Lead } from "@/types/api";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
}: LeadDetailDrawerProps) {
  const enrichMutation = useEnrichLead();
  const emailMutation = useGenerateEmail();
  const deleteMutation = useDeleteLead();

  const isEnriched =
    lead?.enrichment_status === "completed" ||
    lead?.enrichment_status === "enriched";
  const hasEmail = !!lead?.generated_email;

  const handleDelete = () => {
    if (!lead) return;
    deleteMutation.mutate(lead.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-start gap-3 pr-8">
            {/* Company avatar */}
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-border flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">
                {lead.company_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                {lead.company_name}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5 truncate">
                {lead.domain || "No domain"}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-3">
            <LeadStatusBadge
              status={lead.enrichment_status}
              hasEmail={hasEmail}
            />
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Action buttons */}
          <div className="px-6 py-4 flex flex-wrap gap-2 border-b">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              disabled={isEnriched || enrichMutation.isPending}
              onClick={() => enrichMutation.mutate(lead.id)}
              id={`enrich-btn-${lead.id}`}
            >
              {enrichMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              )}
              {enrichMutation.isPending ? "Enriching…" : "Enrich Lead"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              disabled={!isEnriched || emailMutation.isPending}
              onClick={() => emailMutation.mutate(lead.id)}
              id={`generate-email-btn-${lead.id}`}
            >
              {emailMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5 text-blue-500" />
              )}
              {emailMutation.isPending
                ? "Generating…"
                : hasEmail
                ? "Regenerate Email"
                : "Generate Email"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 ml-auto"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              id={`delete-btn-${lead.id}`}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </Button>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Company info section */}
            <Section title="Company Info" icon={Building2}>
              <InfoRow icon={Globe} label="Domain" value={lead.domain} />
              <InfoRow icon={User} label="Contact" value={lead.contact_person} />
              <InfoRow
                icon={Building2}
                label="Industry"
                value={lead.industry}
              />
              <InfoRow
                icon={FileText}
                label="Company Size"
                value={lead.company_size}
              />
            </Section>

            {/* Enrichment section */}
            {isEnriched ? (
              <>
                <Separator />
                <Section title="Enrichment Data" icon={Sparkles}>
                  {lead.company_summary && (
                    <TextBlock
                      label="Company Summary"
                      text={lead.company_summary}
                    />
                  )}
                  {lead.pain_points && (
                    <TextBlock
                      label="Pain Points"
                      text={lead.pain_points}
                      icon={AlertCircle}
                    />
                  )}
                  {lead.outreach_angle && (
                    <TextBlock
                      label="Outreach Angle"
                      text={lead.outreach_angle}
                      icon={Target}
                    />
                  )}
                </Section>
              </>
            ) : (
              <>
                <Separator />
                <EmptyEnrichment
                  isPending={enrichMutation.isPending}
                  onEnrich={() => enrichMutation.mutate(lead.id)}
                  isDisabled={enrichMutation.isPending}
                />
              </>
            )}

            {/* Generated email section */}
            {emailMutation.isPending && (
              <>
                <Separator />
                <EmailGeneratingState />
              </>
            )}

            {!emailMutation.isPending && hasEmail && lead.generated_email && (
              <>
                <Separator />
                <Section title="Generated Email" icon={Mail}>
                  <EmailDisplay email={lead.generated_email} />
                </Section>
              </>
            )}

            {!emailMutation.isPending && !hasEmail && isEnriched && (
              <>
                <Separator />
                <EmptyEmail
                  onGenerate={() => emailMutation.mutate(lead.id)}
                  isPending={emailMutation.isPending}
                />
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <Section title="Timestamps" icon={Clock}>
              <InfoRow
                icon={Calendar}
                label="Created"
                value={formatDate(lead.created_at)}
              />
              {lead.updated_at && (
                <InfoRow
                  icon={RefreshCw}
                  label="Updated"
                  value={formatDate(lead.updated_at)}
                />
              )}
            </Section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground shrink-0 w-24">{label}</span>
      <span className="text-foreground font-medium break-all">{value}</span>
    </div>
  );
}

function TextBlock({
  label,
  text,
  icon: Icon = Lightbulb,
}: {
  label: string;
  text: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-md px-3 py-2.5 border border-border/60">
        {text}
      </p>
    </div>
  );
}

function EmptyEnrichment({
  isPending,
  onEnrich,
  isDisabled,
}: {
  isPending: boolean;
  onEnrich: () => void;
  isDisabled: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5 text-center space-y-3">
      <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto" />
      <div>
        <p className="text-sm font-medium">Not yet enriched</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Run enrichment to get industry insights, pain points, and outreach
          angles.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onEnrich}
        disabled={isDisabled}
        className="gap-1.5 text-xs"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        )}
        {isPending ? "Enriching…" : "Enrich Now"}
      </Button>
    </div>
  );
}

function EmptyEmail({
  onGenerate,
  isPending,
}: {
  onGenerate: () => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5 text-center space-y-3">
      <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto" />
      <div>
        <p className="text-sm font-medium">No email generated</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate a personalized cold email based on the enrichment data.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onGenerate}
        disabled={isPending}
        className="gap-1.5 text-xs"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5 text-blue-500" />
        )}
        {isPending ? "Generating…" : "Generate Email"}
      </Button>
    </div>
  );
}

function EmailGeneratingState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Generating Email
        </h3>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
